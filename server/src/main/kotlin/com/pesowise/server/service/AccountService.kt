package com.pesowise.server.service

import com.pesowise.server.domain.entity.Account
import com.pesowise.server.domain.entity.User
import com.pesowise.server.domain.repository.AccountRepository
import com.pesowise.server.domain.repository.TransactionRepository
import com.pesowise.server.domain.repository.UserRepository
import com.pesowise.server.dto.*
import com.pesowise.server.dto.AccountBalanceDto
import com.pesowise.server.exception.ResourceNotFoundException
import com.pesowise.server.exception.BadRequestException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
@Transactional
class AccountService(
    private val accountRepository: AccountRepository,
    private val userRepository: UserRepository,
    private val transactionRepository: TransactionRepository,
    private val auditService: AuditService
) {
    
    fun getAllAccounts(userId: String): List<AccountDto> {
        val accounts = accountRepository.findByUserIdAndIsActiveTrue(userId)
        return accounts.map { it.toDto() }
    }
    
    fun getAccountById(userId: String, accountId: Long): AccountDto {
        val account = accountRepository.findByUserIdAndId(userId, accountId)
            ?: throw ResourceNotFoundException("Account not found")
        return account.toDto()
    }
    
    fun createAccount(userId: String, request: CreateAccountRequest): AccountDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        val account = Account(
            user = user,
            name = request.name,
            type = request.type,
            currency = request.currency,
            balance = request.initialBalance,
            initialBalance = request.initialBalance,
            icon = request.icon,
            color = request.color,
            isIncludedInTotal = request.isIncludedInTotal
        )
        
        val savedAccount = accountRepository.save(account)
        auditService.logUserAction(user.id, "account_created", "Created account: ${savedAccount.name}")
        
        return savedAccount.toDto()
    }
    
    fun updateAccount(userId: String, accountId: Long, request: UpdateAccountRequest): AccountDto {
        val account = accountRepository.findByUserIdAndId(userId, accountId)
            ?: throw ResourceNotFoundException("Account not found")
        
        request.name?.let { account.name = it }
        request.icon?.let { account.icon = it }
        request.color?.let { account.color = it }
        request.isIncludedInTotal?.let { account.isIncludedInTotal = it }
        
        val updatedAccount = accountRepository.save(account)
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "account_updated", "Updated account: ${updatedAccount.name}")
        
        return updatedAccount.toDto()
    }
    
    fun deleteAccount(userId: String, accountId: Long) {
        val account = accountRepository.findByUserIdAndId(userId, accountId)
            ?: throw ResourceNotFoundException("Account not found")
        
        // Check if account has transactions
        val transactionCount = transactionRepository.countByUserId(userId)
        if (transactionCount > 0) {
            throw BadRequestException("Cannot delete account with existing transactions")
        }
        
        account.isActive = false
        accountRepository.save(account)
        
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "account_deleted", "Deleted account: ${account.name}")
    }
    
    fun getTotalBalance(userId: String): BigDecimal {
        return accountRepository.getTotalBalance(userId) ?: BigDecimal.ZERO
    }
    
    fun getAccountBalances(userId: String): List<AccountBalanceDto> {
        val accounts = accountRepository.findByUserIdAndIsActiveTrue(userId)
        val totalBalance = getTotalBalance(userId)
        
        return accounts.filter { it.isIncludedInTotal }.map { account ->
            AccountBalanceDto(
                accountId = account.id,
                accountName = account.name,
                accountType = account.type,
                balance = account.balance,
                currency = account.currency,
                percentageOfTotal = if (totalBalance > BigDecimal.ZERO) {
                    (account.balance.divide(totalBalance, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
                } else 0.0
            )
        }
    }
    
    fun adjustAccountBalance(accountId: Long, amount: BigDecimal, operation: String) {
        val account = accountRepository.findById(accountId)
            .orElseThrow { ResourceNotFoundException("Account not found") }
        
        when (operation) {
            "ADD" -> account.balance = account.balance.add(amount)
            "SUBTRACT" -> account.balance = account.balance.subtract(amount)
            else -> throw BadRequestException("Invalid operation")
        }
        
        accountRepository.save(account)
    }
    
    private fun Account.toDto() = AccountDto(
        id = id,
        name = name,
        type = type,
        currency = currency,
        balance = balance,
        initialBalance = initialBalance,
        icon = icon,
        color = color,
        isActive = isActive,
        isIncludedInTotal = isIncludedInTotal,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
