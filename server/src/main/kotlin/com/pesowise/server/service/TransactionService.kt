package com.pesowise.server.service

import com.pesowise.server.domain.entity.Transaction
import com.pesowise.server.domain.entity.TransactionType
import com.pesowise.server.domain.entity.User
import com.pesowise.server.domain.repository.*
import com.pesowise.server.dto.*
import com.pesowise.server.exception.ResourceNotFoundException
import com.pesowise.server.exception.BadRequestException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Transactional
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val categoryRepository: CategoryRepository,
    private val userRepository: UserRepository,
    private val accountService: AccountService,
    private val budgetService: BudgetService,
    private val notificationService: NotificationService,
    private val auditService: AuditService
) {
    
    fun getTransactions(userId: String, pageable: Pageable): PaginatedResponse<TransactionDto> {
        val page = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId, pageable)
        return page.toPaginatedResponse()
    }
    
    fun getTransactionsByAccount(userId: String, accountId: Long, pageable: Pageable): PaginatedResponse<TransactionDto> {
        val page = transactionRepository.findByUserIdAndAccountId(userId, accountId, pageable)
        return page.toPaginatedResponse()
    }
    
    fun getTransactionsByCategory(userId: String, categoryId: Long, pageable: Pageable): PaginatedResponse<TransactionDto> {
        val page = transactionRepository.findByUserIdAndCategoryId(userId, categoryId, pageable)
        return page.toPaginatedResponse()
    }
    
    fun getTransactionsByDateRange(userId: String, startDate: LocalDate, endDate: LocalDate): List<TransactionDto> {
        val transactions = transactionRepository.findByUserIdAndDateRange(userId, startDate, endDate)
        return transactions.map { it.toDto() }
    }
    
    fun searchTransactions(userId: String, search: String, pageable: Pageable): PaginatedResponse<TransactionDto> {
        val page = transactionRepository.searchTransactions(userId, search, pageable)
        return page.toPaginatedResponse()
    }
    
    fun getTransactionById(userId: String, transactionId: Long): TransactionDto {
        val transaction = transactionRepository.findByUserIdAndId(userId, transactionId)
            ?: throw ResourceNotFoundException("Transaction not found")
        return transaction.toDto()
    }
    
    fun createTransaction(userId: String, request: CreateTransactionRequest): TransactionDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        // Validate account
        val account = accountRepository.findByUserIdAndId(userId, request.accountId)
            ?: throw ResourceNotFoundException("Account not found")
        
        // Validate category
        val category = categoryRepository.findById(request.categoryId)
            .orElseThrow { ResourceNotFoundException("Category not found") }
        
        // Check if user has access to category
        if (category.user != null && category.user!!.id != userId) {
            throw ResourceNotFoundException("Category not found")
        }
        
        // Validate transaction type matches category type
        if (request.type != TransactionType.TRANSFER && request.type != category.type) {
            throw BadRequestException("Transaction type must match category type")
        }
        
        // Handle transfer transactions
        if (request.type == TransactionType.TRANSFER) {
            return createTransferTransaction(user, request)
        }
        
        // Create regular transaction
        val transaction = Transaction(
            user = user,
            account = account,
            category = category,
            amount = request.amount,
            type = request.type,
            description = request.description,
            transactionDate = request.transactionDate,
            tags = request.tags?.toTypedArray(),
            location = request.location,
            receiptUrl = request.receiptUrl
        )
        
        val savedTransaction = transactionRepository.save(transaction)
        
        // Update account balance
        when (request.type) {
            TransactionType.INCOME -> accountService.adjustAccountBalance(account.id, request.amount, "ADD")
            TransactionType.EXPENSE -> accountService.adjustAccountBalance(account.id, request.amount, "SUBTRACT")
            else -> {}
        }
        
        // Check budget alerts
        if (request.type == TransactionType.EXPENSE) {
            budgetService.checkBudgetAlert(userId, category.id, request.transactionDate)
        }
        
        auditService.logUserAction(user.id, "transaction_created", 
            "Created ${request.type} transaction: ${request.amount} in ${category.name}")
        
        return savedTransaction.toDto()
    }
    
    private fun createTransferTransaction(user: User, request: CreateTransactionRequest): TransactionDto {
        if (request.fromAccountId == null || request.toAccountId == null) {
            throw BadRequestException("Transfer transactions require both fromAccountId and toAccountId")
        }
        
        val fromAccount = accountRepository.findByUserIdAndId(user.id, request.fromAccountId)
            ?: throw ResourceNotFoundException("From account not found")
        
        val toAccount = accountRepository.findByUserIdAndId(user.id, request.toAccountId)
            ?: throw ResourceNotFoundException("To account not found")
        
        if (fromAccount.id == toAccount.id) {
            throw BadRequestException("Cannot transfer to the same account")
        }
        
        // Get transfer category
        val transferCategory = categoryRepository.findAllAvailableForUserByType(user.id, TransactionType.TRANSFER)
            .firstOrNull() ?: throw ResourceNotFoundException("Transfer category not found")
        
        // Create transfer transaction
        val transaction = Transaction(
            user = user,
            account = fromAccount,
            category = transferCategory,
            amount = request.amount,
            type = TransactionType.TRANSFER,
            description = request.description ?: "Transfer from ${fromAccount.name} to ${toAccount.name}",
            transactionDate = request.transactionDate,
            fromAccount = fromAccount,
            toAccount = toAccount,
            tags = request.tags?.toTypedArray(),
            location = request.location
        )
        
        val savedTransaction = transactionRepository.save(transaction)
        
        // Update account balances
        accountService.adjustAccountBalance(fromAccount.id, request.amount, "SUBTRACT")
        accountService.adjustAccountBalance(toAccount.id, request.amount, "ADD")
        
        auditService.logUserAction(user.id, "transfer_created", 
            "Transfer ${request.amount} from ${fromAccount.name} to ${toAccount.name}")
        
        return savedTransaction.toDto()
    }
    
    fun updateTransaction(userId: String, transactionId: Long, request: UpdateTransactionRequest): TransactionDto {
        val transaction = transactionRepository.findByUserIdAndId(userId, transactionId)
            ?: throw ResourceNotFoundException("Transaction not found")
        
        val oldAmount = transaction.amount
        val oldType = transaction.type
        
        // Update category if provided
        if (request.categoryId != null) {
            val category = categoryRepository.findById(request.categoryId)
                .orElseThrow { ResourceNotFoundException("Category not found") }
            
            if (category.user != null && category.user!!.id != userId) {
                throw ResourceNotFoundException("Category not found")
            }
            
            if (transaction.type != TransactionType.TRANSFER && transaction.type != category.type) {
                throw BadRequestException("Cannot change transaction type")
            }
            
            transaction.category = category
        }
        
        // Update other fields
        request.amount?.let { transaction.amount = it }
        request.description?.let { transaction.description = it }
        request.transactionDate?.let { transaction.transactionDate = it }
        request.tags?.let { transaction.tags = it.toTypedArray() }
        request.location?.let { transaction.location = it }
        request.receiptUrl?.let { transaction.receiptUrl = it }
        
        val updatedTransaction = transactionRepository.save(transaction)
        
        // Adjust account balance if amount changed
        if (oldAmount != transaction.amount && transaction.type != TransactionType.TRANSFER) {
            val difference = transaction.amount - oldAmount
            when (transaction.type) {
                TransactionType.INCOME -> accountService.adjustAccountBalance(transaction.account.id, difference, "ADD")
                TransactionType.EXPENSE -> accountService.adjustAccountBalance(transaction.account.id, difference, "SUBTRACT")
                else -> {}
            }
        }
        
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "transaction_updated", "Updated transaction ID: ${transaction.id}")
        
        return updatedTransaction.toDto()
    }
    
    fun deleteTransaction(userId: String, transactionId: Long) {
        val transaction = transactionRepository.findByUserIdAndId(userId, transactionId)
            ?: throw ResourceNotFoundException("Transaction not found")
        
        // Reverse account balance changes
        when (transaction.type) {
            TransactionType.INCOME -> accountService.adjustAccountBalance(transaction.account.id, transaction.amount, "SUBTRACT")
            TransactionType.EXPENSE -> accountService.adjustAccountBalance(transaction.account.id, transaction.amount, "ADD")
            TransactionType.TRANSFER -> {
                if (transaction.fromAccount != null && transaction.toAccount != null) {
                    accountService.adjustAccountBalance(transaction.fromAccount!!.id, transaction.amount, "ADD")
                    accountService.adjustAccountBalance(transaction.toAccount!!.id, transaction.amount, "SUBTRACT")
                }
            }
        }
        
        transactionRepository.delete(transaction)
        
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "transaction_deleted", "Deleted transaction ID: ${transaction.id}")
    }
    
    fun getMonthlyIncome(userId: String, month: LocalDate): BigDecimal {
        val startDate = month.withDayOfMonth(1)
        val endDate = month.withDayOfMonth(month.lengthOfMonth())
        return transactionRepository.getTotalByTypeAndDateRange(userId, TransactionType.INCOME, startDate, endDate) 
            ?: BigDecimal.ZERO
    }
    
    fun getMonthlyExpenses(userId: String, month: LocalDate): BigDecimal {
        val startDate = month.withDayOfMonth(1)
        val endDate = month.withDayOfMonth(month.lengthOfMonth())
        return transactionRepository.getTotalByTypeAndDateRange(userId, TransactionType.EXPENSE, startDate, endDate) 
            ?: BigDecimal.ZERO
    }
    
    fun getCategoryBreakdown(userId: String, type: TransactionType, startDate: LocalDate, endDate: LocalDate): List<CategoryBreakdownDto> {
        val results = transactionRepository.getCategoryBreakdown(userId, type, startDate, endDate)
        val total = results.sumOf { (it[1] as BigDecimal) }
        
        return results.map { result ->
            val categoryName = result[0] as String
            val amount = result[1] as BigDecimal
            
            CategoryBreakdownDto(
                categoryName = categoryName,
                amount = amount,
                percentage = if (total > BigDecimal.ZERO) {
                    (amount.divide(total, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
                } else 0.0,
                transactionCount = 0 // TODO: Add transaction count to query
            )
        }
    }
    
    private fun Transaction.toDto() = TransactionDto(
        id = id,
        accountId = account.id,
        accountName = account.name,
        categoryId = category.id,
        categoryName = category.name,
        amount = amount,
        type = type,
        description = description,
        transactionDate = transactionDate,
        fromAccountId = fromAccount?.id,
        fromAccountName = fromAccount?.name,
        toAccountId = toAccount?.id,
        toAccountName = toAccount?.name,
        tags = tags?.toList(),
        location = location,
        receiptUrl = receiptUrl,
        isRecurring = isRecurring,
        createdAt = createdAt
    )
    
    private fun Page<Transaction>.toPaginatedResponse(): PaginatedResponse<TransactionDto> {
        return PaginatedResponse(
            content = content.map { it.toDto() },
            totalElements = totalElements,
            totalPages = totalPages,
            currentPage = number,
            pageSize = size,
            isFirst = isFirst,
            isLast = isLast
        )
    }
}
