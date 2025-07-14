package com.pesowise.server.dto

import com.pesowise.server.domain.entity.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

// Account DTOs
data class AccountDto(
    val id: Long = 0,
    val name: String,
    val type: AccountType,
    val currency: String = "PHP",
    val balance: BigDecimal = BigDecimal.ZERO,
    val initialBalance: BigDecimal = BigDecimal.ZERO,
    val icon: String? = null,
    val color: String? = null,
    val isActive: Boolean = true,
    val isIncludedInTotal: Boolean = true,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class CreateAccountRequest(
    val name: String,
    val type: AccountType,
    val currency: String = "PHP",
    val initialBalance: BigDecimal = BigDecimal.ZERO,
    val icon: String? = null,
    val color: String? = null,
    val isIncludedInTotal: Boolean = true
)

data class UpdateAccountRequest(
    val name: String? = null,
    val icon: String? = null,
    val color: String? = null,
    val isIncludedInTotal: Boolean? = null
)

// Category DTOs
data class CategoryDto(
    val id: Long = 0,
    val name: String,
    val type: TransactionType,
    val icon: String? = null,
    val color: String? = null,
    val isSystem: Boolean = false,
    val isActive: Boolean = true,
    val parentId: Long? = null,
    var subCategories: List<CategoryDto>? = null
)

data class CreateCategoryRequest(
    val name: String,
    val type: TransactionType,
    val icon: String? = null,
    val color: String? = null,
    val parentId: Long? = null
)

// Transaction DTOs
data class TransactionDto(
    val id: Long = 0,
    val accountId: Long,
    val accountName: String? = null,
    val categoryId: Long,
    val categoryName: String? = null,
    val amount: BigDecimal,
    val type: TransactionType,
    val description: String? = null,
    val transactionDate: LocalDate,
    val fromAccountId: Long? = null,
    val fromAccountName: String? = null,
    val toAccountId: Long? = null,
    val toAccountName: String? = null,
    val tags: List<String>? = null,
    val location: String? = null,
    val receiptUrl: String? = null,
    val isRecurring: Boolean = false,
    val createdAt: LocalDateTime? = null
)

data class CreateTransactionRequest(
    val accountId: Long,
    val categoryId: Long,
    val amount: BigDecimal,
    val type: TransactionType,
    val description: String? = null,
    val transactionDate: LocalDate,
    val fromAccountId: Long? = null,
    val toAccountId: Long? = null,
    val tags: List<String>? = null,
    val location: String? = null,
    val receiptUrl: String? = null
)

data class UpdateTransactionRequest(
    val categoryId: Long? = null,
    val amount: BigDecimal? = null,
    val description: String? = null,
    val transactionDate: LocalDate? = null,
    val tags: List<String>? = null,
    val location: String? = null,
    val receiptUrl: String? = null
)

// Budget DTOs
data class BudgetDto(
    val id: Long = 0,
    val name: String,
    val categoryId: Long? = null,
    val categoryName: String? = null,
    val amount: BigDecimal,
    val period: BudgetPeriod,
    val startDate: LocalDate,
    val endDate: LocalDate? = null,
    val isActive: Boolean = true,
    val notifyPercentage: Int = 80,
    val spent: BigDecimal? = null,
    val remaining: BigDecimal? = null,
    val percentageUsed: Double? = null
)

data class CreateBudgetRequest(
    val name: String,
    val categoryId: Long? = null,
    val amount: BigDecimal,
    val period: BudgetPeriod,
    val startDate: LocalDate,
    val endDate: LocalDate? = null,
    val notifyPercentage: Int = 80
)

data class UpdateBudgetRequest(
    val name: String? = null,
    val amount: BigDecimal? = null,
    val notifyPercentage: Int? = null,
    val endDate: LocalDate? = null,
    val isActive: Boolean? = null
)

// Goal DTOs
data class GoalDto(
    val id: Long = 0,
    val name: String,
    val targetAmount: BigDecimal,
    val currentAmount: BigDecimal = BigDecimal.ZERO,
    val targetDate: LocalDate,
    val category: GoalCategory? = null,
    val description: String? = null,
    val icon: String? = null,
    val color: String? = null,
    val isActive: Boolean = true,
    val isCompleted: Boolean = false,
    val completedAt: LocalDateTime? = null,
    val percentageComplete: Double = 0.0,
    val daysRemaining: Long? = null
)

data class CreateGoalRequest(
    val name: String,
    val targetAmount: BigDecimal,
    val targetDate: LocalDate,
    val category: GoalCategory? = null,
    val description: String? = null,
    val icon: String? = null,
    val color: String? = null
)

data class UpdateGoalRequest(
    val name: String? = null,
    val targetAmount: BigDecimal? = null,
    val targetDate: LocalDate? = null,
    val description: String? = null,
    val icon: String? = null,
    val color: String? = null,
    val isActive: Boolean? = null
)

// Goal Contribution DTOs
data class GoalContributionDto(
    val id: Long = 0,
    val goalId: Long,
    val goalName: String? = null,
    val accountId: Long,
    val accountName: String? = null,
    val amount: BigDecimal,
    val contributionDate: LocalDate,
    val notes: String? = null
)

data class CreateGoalContributionRequest(
    val accountId: Long,
    val amount: BigDecimal,
    val contributionDate: LocalDate = LocalDate.now(),
    val notes: String? = null
)

// Notification DTOs
data class NotificationDto(
    val id: Long = 0,
    val type: NotificationType,
    val title: String,
    val message: String,
    val data: Map<String, Any>? = null,
    val isRead: Boolean = false,
    val readAt: LocalDateTime? = null,
    val createdAt: LocalDateTime
)

// Analytics DTOs
data class DashboardSummaryDto(
    val totalBalance: BigDecimal,
    val monthlyIncome: BigDecimal,
    val monthlyExpenses: BigDecimal,
    val savingsRate: Double,
    val activeGoals: Int,
    val completedGoals: Int,
    val activeBudgets: Int,
    val recentTransactions: List<TransactionDto>
)

data class CategoryBreakdownDto(
    val categoryName: String,
    val amount: BigDecimal,
    val percentage: Double,
    val transactionCount: Int
)

data class AccountBalanceDto(
    val accountId: Long,
    val accountName: String,
    val accountType: AccountType,
    val balance: BigDecimal,
    val currency: String,
    val percentageOfTotal: Double
)

data class BudgetProgressDto(
    val budget: BudgetDto,
    val transactions: List<TransactionDto>,
    val categoryBreakdown: List<CategoryBreakdownDto>?
)

data class GoalProgressDto(
    val goal: GoalDto,
    val contributions: List<GoalContributionDto>,
    val monthlyContributionNeeded: BigDecimal?
)

// Request/Response wrappers
data class TransactionFilterRequest(
    val accountId: Long? = null,
    val categoryId: Long? = null,
    val type: TransactionType? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val minAmount: BigDecimal? = null,
    val maxAmount: BigDecimal? = null,
    val search: String? = null
)

data class PaginatedResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int,
    val isFirst: Boolean,
    val isLast: Boolean
)
