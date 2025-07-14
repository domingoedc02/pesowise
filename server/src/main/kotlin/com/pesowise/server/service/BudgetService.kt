package com.pesowise.server.service

import com.pesowise.server.domain.entity.Budget
import com.pesowise.server.domain.entity.BudgetPeriod
import com.pesowise.server.domain.entity.NotificationType
import com.pesowise.server.domain.entity.TransactionType
import com.pesowise.server.domain.repository.BudgetRepository
import com.pesowise.server.domain.repository.CategoryRepository
import com.pesowise.server.domain.repository.TransactionRepository
import com.pesowise.server.domain.repository.UserRepository
import com.pesowise.server.dto.*
import com.pesowise.server.dto.BudgetProgressDto
import com.pesowise.server.exception.ResourceNotFoundException
import com.pesowise.server.exception.BadRequestException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
@Transactional
class BudgetService(
    private val budgetRepository: BudgetRepository,
    private val categoryRepository: CategoryRepository,
    private val transactionRepository: TransactionRepository,
    private val userRepository: UserRepository,
    private val notificationService: NotificationService,
    private val auditService: AuditService
) {
    
    fun getAllBudgets(userId: String): List<BudgetDto> {
        val budgets = budgetRepository.findByUserIdAndIsActiveTrue(userId)
        return budgets.map { budget ->
            val spent = calculateBudgetSpent(userId, budget)
            budget.toDto(spent)
        }
    }
    
    fun getBudgetById(userId: String, budgetId: Long): BudgetDto {
        val budget = budgetRepository.findByUserIdAndId(userId, budgetId)
            ?: throw ResourceNotFoundException("Budget not found")
        
        val spent = calculateBudgetSpent(userId, budget)
        return budget.toDto(spent)
    }
    
    fun createBudget(userId: String, request: CreateBudgetRequest): BudgetDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        // Validate category if provided
        var category: com.pesowise.server.domain.entity.Category? = null
        if (request.categoryId != null) {
            category = categoryRepository.findById(request.categoryId)
                .orElseThrow { ResourceNotFoundException("Category not found") }
            
            // Check if user has access to category
            if (category.user != null && category.user!!.id != userId) {
                throw ResourceNotFoundException("Category not found")
            }
            
            // Ensure category is expense type
            if (category.type != TransactionType.EXPENSE) {
                throw BadRequestException("Budget can only be created for expense categories")
            }
        }
        
        // Check for existing budget
        if (request.categoryId != null) {
            val existingBudget = budgetRepository.findActiveBudgetForCategory(
                userId, request.categoryId, request.startDate
            )
            if (existingBudget != null) {
                throw BadRequestException("Active budget already exists for this category")
            }
        }
        
        val budget = Budget(
            user = user,
            name = request.name,
            category = category,
            amount = request.amount,
            period = request.period,
            startDate = request.startDate,
            endDate = request.endDate,
            notifyPercentage = request.notifyPercentage
        )
        
        val savedBudget = budgetRepository.save(budget)
        auditService.logUserAction(user.id, "budget_created", "Created budget: ${savedBudget.name}")
        
        return savedBudget.toDto(BigDecimal.ZERO)
    }
    
    fun updateBudget(userId: String, budgetId: Long, request: UpdateBudgetRequest): BudgetDto {
        val budget = budgetRepository.findByUserIdAndId(userId, budgetId)
            ?: throw ResourceNotFoundException("Budget not found")
        
        request.name?.let { budget.name = it }
        request.amount?.let { budget.amount = it }
        request.notifyPercentage?.let { budget.notifyPercentage = it }
        request.endDate?.let { budget.endDate = it }
        request.isActive?.let { budget.isActive = it }
        
        val updatedBudget = budgetRepository.save(budget)
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "budget_updated", "Updated budget: ${updatedBudget.name}")
        
        val spent = calculateBudgetSpent(userId, updatedBudget)
        return updatedBudget.toDto(spent)
    }
    
    fun deleteBudget(userId: String, budgetId: Long) {
        val budget = budgetRepository.findByUserIdAndId(userId, budgetId)
            ?: throw ResourceNotFoundException("Budget not found")
        
        budget.isActive = false
        budgetRepository.save(budget)
        
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "budget_deleted", "Deleted budget: ${budget.name}")
    }
    
    fun getBudgetProgress(userId: String, budgetId: Long): BudgetProgressDto {
        val budget = budgetRepository.findByUserIdAndId(userId, budgetId)
            ?: throw ResourceNotFoundException("Budget not found")
        
        val spent = calculateBudgetSpent(userId, budget)
        val budgetDto = budget.toDto(spent)
        
        val (startDate, endDate) = getBudgetPeriodDates(budget)
        
        val transactions = if (budget.category != null) {
            transactionRepository.findByUserIdAndDateRange(userId, startDate, endDate)
                .filter { it.category.id == budget.category!!.id }
        } else {
            transactionRepository.findByUserIdAndDateRange(userId, startDate, endDate)
                .filter { it.type == TransactionType.EXPENSE }
        }
        
        val categoryBreakdown = if (budget.category == null) {
            calculateCategoryBreakdown(transactions)
        } else null
        
        return BudgetProgressDto(
            budget = budgetDto,
            transactions = transactions.map { it.toTransactionDto() },
            categoryBreakdown = categoryBreakdown
        )
    }
    
    fun checkBudgetAlert(userId: String, categoryId: Long, transactionDate: LocalDate) {
        val budgets = budgetRepository.findActiveBudgetsForDate(userId, transactionDate)
        
        budgets.forEach { budget ->
            if (budget.category == null || budget.category!!.id == categoryId) {
                val spent = calculateBudgetSpent(userId, budget)
                val percentageUsed = (spent.divide(budget.amount, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
                
                if (percentageUsed >= budget.notifyPercentage) {
                    notificationService.createNotification(
                        userId = userId,
                        type = NotificationType.BUDGET_ALERT,
                        title = "Budget Alert: ${budget.name}",
                        message = "You have used ${percentageUsed.toInt()}% of your budget for ${budget.name}",
                        data = mapOf(
                            "budgetId" to budget.id,
                            "spent" to spent,
                            "limit" to budget.amount,
                            "percentageUsed" to percentageUsed
                        )
                    )
                }
            }
        }
    }
    
    private fun calculateBudgetSpent(userId: String, budget: Budget): BigDecimal {
        val (startDate, endDate) = getBudgetPeriodDates(budget)
        
        return if (budget.category != null) {
            transactionRepository.getTotalByTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate
            ) ?: BigDecimal.ZERO
        } else {
            transactionRepository.getTotalByTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate
            ) ?: BigDecimal.ZERO
        }
    }
    
    private fun getBudgetPeriodDates(budget: Budget): Pair<LocalDate, LocalDate> {
        val today = LocalDate.now()
        
        return when (budget.period) {
            BudgetPeriod.WEEKLY -> {
                val startOfWeek = today.minusDays(today.dayOfWeek.value.toLong() - 1)
                val endOfWeek = startOfWeek.plusDays(6)
                startOfWeek to endOfWeek
            }
            BudgetPeriod.MONTHLY -> {
                val startOfMonth = today.withDayOfMonth(1)
                val endOfMonth = today.withDayOfMonth(today.lengthOfMonth())
                startOfMonth to endOfMonth
            }
            BudgetPeriod.YEARLY -> {
                val startOfYear = today.withDayOfYear(1)
                val endOfYear = today.withDayOfYear(today.lengthOfYear())
                startOfYear to endOfYear
            }
        }
    }
    
    private fun calculateCategoryBreakdown(transactions: List<com.pesowise.server.domain.entity.Transaction>): List<CategoryBreakdownDto> {
        val categoryTotals = transactions.groupBy { it.category.name }
            .mapValues { (_, trans) -> trans.sumOf { it.amount } }
        
        val total = categoryTotals.values.sumOf { it }
        
        return categoryTotals.map { (categoryName, amount) ->
            CategoryBreakdownDto(
                categoryName = categoryName,
                amount = amount,
                percentage = if (total > BigDecimal.ZERO) {
                    (amount.divide(total, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
                } else 0.0,
                transactionCount = transactions.count { it.category.name == categoryName }
            )
        }.sortedByDescending { it.amount }
    }
    
    private fun Budget.toDto(spent: BigDecimal) = BudgetDto(
        id = id,
        name = name,
        categoryId = category?.id,
        categoryName = category?.name,
        amount = amount,
        period = period,
        startDate = startDate,
        endDate = endDate,
        isActive = isActive,
        notifyPercentage = notifyPercentage,
        spent = spent,
        remaining = amount - spent,
        percentageUsed = if (amount > BigDecimal.ZERO) {
            (spent.divide(amount, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
        } else 0.0
    )
    
    private fun com.pesowise.server.domain.entity.Transaction.toTransactionDto() = TransactionDto(
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
}
