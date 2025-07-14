package com.pesowise.server.service

import com.pesowise.server.domain.repository.*
import com.pesowise.server.dto.AccountBalanceDto
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.scheduling.annotation.Scheduled
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

@Service
class AnalyticsService(
    private val transactionRepository: TransactionRepository,
    private val budgetRepository: BudgetRepository,
    private val categoryRepository: CategoryRepository,
    private val accountRepository: AccountRepository,
    private val goalRepository: GoalRepository
) {

    @Cacheable(value = ["analytics-spending"], key = "#userId + '_' + #startDate + '_' + #endDate")
    fun getSpendingAnalytics(userId: String, startDate: LocalDate, endDate: LocalDate): SpendingAnalyticsResponse {
        val expenses = transactionRepository.findExpensesByUserAndDateRange(userId, startDate, endDate)
        val income = transactionRepository.findIncomeByUserAndDateRange(userId, startDate, endDate)
        
        val categoryBreakdown = expenses.groupBy { it.category.name }
            .map { (categoryName, transactions) ->
                CategorySpendingDto(
                    categoryName = categoryName,
                    amount = transactions.sumOf { it.amount },
                    percentage = 0.0, // Will calculate after
                    transactionCount = transactions.size,
                    color = transactions.first().category.color ?: "#757575"
                )
            }
            .sortedByDescending { it.amount }

        val totalExpenses = categoryBreakdown.sumOf { it.amount }
        val updatedBreakdown = categoryBreakdown.map { 
            it.copy(percentage = if (totalExpenses > BigDecimal.ZERO) 
                (it.amount.toDouble() / totalExpenses.toDouble()) * 100 else 0.0) 
        }

        return SpendingAnalyticsResponse(
            totalIncome = income.sumOf { it.amount },
            totalExpenses = totalExpenses,
            netSavings = income.sumOf { it.amount } - totalExpenses,
            categoryBreakdown = updatedBreakdown,
            period = "$startDate to $endDate"
        )
    }

    @Cacheable(value = ["analytics-trends"], key = "#userId + '_' + #months")
    fun getMonthlyTrends(userId: String, months: Int = 6): MonthlyTrendsResponse {
        val endDate = LocalDate.now()
        val startDate = endDate.minusMonths(months.toLong())
        
        val trends = mutableListOf<MonthlyTrendDto>()
        var currentDate = YearMonth.from(startDate)
        val endYearMonth = YearMonth.from(endDate)
        
        while (!currentDate.isAfter(endYearMonth)) {
            val monthStart = currentDate.atDay(1)
            val monthEnd = currentDate.atEndOfMonth()
            
            val monthIncome = transactionRepository.findIncomeByUserAndDateRange(userId, monthStart, monthEnd)
                .sumOf { it.amount }
            val monthExpenses = transactionRepository.findExpensesByUserAndDateRange(userId, monthStart, monthEnd)
                .sumOf { it.amount }
            
            trends.add(MonthlyTrendDto(
                month = currentDate.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                income = monthIncome,
                expenses = monthExpenses,
                savings = monthIncome - monthExpenses
            ))
            
            currentDate = currentDate.plusMonths(1)
        }
        
        return MonthlyTrendsResponse(trends = trends)
    }

    @Cacheable(value = ["analytics-budgets"], key = "#userId")
    fun getBudgetAnalytics(userId: String): BudgetAnalyticsResponse {
        val activeBudgets = budgetRepository.findByUserIdAndIsActiveTrue(userId)
        val currentDate = LocalDate.now()
        
        val budgetProgress = activeBudgets.map { budget ->
            // Calculate spent amount from transactions
            val spentAmount = if (budget.category != null) {
                transactionRepository.findExpensesByUserAndDateRange(
                    userId, budget.startDate, budget.endDate ?: currentDate
                ).filter { it.category.id == budget.category?.id }
                 .sumOf { it.amount }
            } else {
                transactionRepository.findExpensesByUserAndDateRange(
                    userId, budget.startDate, budget.endDate ?: currentDate
                ).sumOf { it.amount }
            }
            
            val percentageUsed = if (budget.amount > BigDecimal.ZERO) {
                (spentAmount.toDouble() / budget.amount.toDouble()) * 100
            } else 0.0
            
            val daysRemaining = budget.endDate?.let { endDate ->
                if (endDate.isAfter(currentDate)) {
                    java.time.temporal.ChronoUnit.DAYS.between(currentDate, endDate).toInt()
                } else 0
            } ?: 0
            
            BudgetProgressDto(
                budgetId = budget.id,
                budgetName = budget.name,
                categoryName = budget.category?.name,
                budgetAmount = budget.amount,
                spentAmount = spentAmount,
                remainingAmount = budget.amount - spentAmount,
                percentageUsed = percentageUsed,
                daysRemaining = daysRemaining,
                status = when {
                    percentageUsed >= 100 -> "OVER_BUDGET"
                    percentageUsed >= budget.notifyPercentage -> "WARNING"
                    else -> "ON_TRACK"
                }
            )
        }
        
        return BudgetAnalyticsResponse(
            totalBudgets = activeBudgets.size,
            totalBudgetAmount = activeBudgets.sumOf { it.amount },
            totalSpent = budgetProgress.sumOf { it.spentAmount },
            budgetsOnTrack = budgetProgress.count { it.status == "ON_TRACK" },
            budgetsOverBudget = budgetProgress.count { it.status == "OVER_BUDGET" },
            budgetProgress = budgetProgress
        )
    }

    @Cacheable(value = ["analytics-goals"], key = "#userId")
    fun getGoalAnalytics(userId: String): GoalAnalyticsResponse {
        val goals = goalRepository.findByUserIdAndIsActiveTrue(userId)
        val currentDate = LocalDate.now()
        
        val goalProgress = goals.map { goal ->
            val percentageComplete = if (goal.targetAmount > BigDecimal.ZERO) {
                (goal.currentAmount.toDouble() / goal.targetAmount.toDouble()) * 100
            } else 0.0
            
            val daysRemaining = if (goal.targetDate.isAfter(currentDate)) {
                java.time.temporal.ChronoUnit.DAYS.between(currentDate, goal.targetDate).toInt()
            } else 0
            
            GoalProgressDto(
                goalId = goal.id,
                goalName = goal.name,
                targetAmount = goal.targetAmount,
                currentAmount = goal.currentAmount,
                remainingAmount = goal.targetAmount - goal.currentAmount,
                percentageComplete = percentageComplete,
                daysRemaining = daysRemaining,
                category = goal.category?.name ?: "OTHER",
                isCompleted = goal.isCompleted
            )
        }
        
        return GoalAnalyticsResponse(
            totalGoals = goals.size,
            completedGoals = goals.count { it.isCompleted },
            totalTargetAmount = goals.sumOf { it.targetAmount },
            totalSavedAmount = goals.sumOf { it.currentAmount },
            averageProgress = if (goals.isNotEmpty()) 
                goalProgress.map { it.percentageComplete }.average() else 0.0,
            goalProgress = goalProgress
        )
    }

    @Cacheable(value = ["analytics-accounts"], key = "#userId")
    fun getAccountAnalytics(userId: String): AccountAnalyticsResponse {
        val accounts = accountRepository.findByUserIdAndIsActiveTrue(userId)
        
        val accountBreakdown = accounts.map { account ->
            AccountBalanceDto(
                accountId = account.id,
                accountName = account.name,
                accountType = account.type,
                balance = account.balance,
                currency = account.currency,
                percentageOfTotal = 0.0 // Will calculate after
            )
        }
        
        val totalBalance = accounts.sumOf { it.balance }
        val updatedBreakdown = accountBreakdown.map {
            it.copy(percentageOfTotal = if (totalBalance > BigDecimal.ZERO) 
                (it.balance.toDouble() / totalBalance.toDouble()) * 100 else 0.0)
        }
        
        return AccountAnalyticsResponse(
            totalBalance = totalBalance,
            totalAccounts = accounts.size,
            accountBreakdown = updatedBreakdown
        )
    }

    @Cacheable(value = ["analytics-insights"], key = "#userId")
    fun getFinancialInsights(userId: String): FinancialInsightsResponse {
        val currentMonth = LocalDate.now().withDayOfMonth(1)
        val previousMonth = currentMonth.minusMonths(1)
        
        val currentMonthExpenses = transactionRepository.findExpensesByUserAndDateRange(
            userId, currentMonth, LocalDate.now()
        ).sumOf { it.amount }
        
        val previousMonthExpenses = transactionRepository.findExpensesByUserAndDateRange(
            userId, previousMonth, previousMonth.plusMonths(1).minusDays(1)
        ).sumOf { it.amount }
        
        val spendingChange = if (previousMonthExpenses > BigDecimal.ZERO) {
            ((currentMonthExpenses - previousMonthExpenses).toDouble() / previousMonthExpenses.toDouble()) * 100
        } else 0.0
        
        val insights = mutableListOf<String>()
        
        if (spendingChange > 20) {
            insights.add("Your spending has increased by ${String.format("%.1f", spendingChange)}% this month")
        } else if (spendingChange < -20) {
            insights.add("Great job! You've reduced spending by ${String.format("%.1f", kotlin.math.abs(spendingChange))}% this month")
        }
        
        val topCategory = transactionRepository.findExpensesByUserAndDateRange(userId, currentMonth, LocalDate.now())
            .groupBy { it.category.name }
            .maxByOrNull { it.value.sumOf { tx -> tx.amount } }
        
        if (topCategory != null && topCategory.value.sumOf { it.amount } > BigDecimal.ZERO) {
            insights.add("Your highest spending category this month is ${topCategory.key}")
        }
        
        val overBudgetCount = budgetRepository.findByUserIdAndIsActiveTrue(userId)
            .count { budget ->
                val spentAmount = if (budget.category != null) {
                    transactionRepository.findExpensesByUserAndDateRange(
                        userId, budget.startDate, budget.endDate ?: LocalDate.now()
                    ).filter { it.category.id == budget.category?.id }
                     .sumOf { it.amount }
                } else {
                    transactionRepository.findExpensesByUserAndDateRange(
                        userId, budget.startDate, budget.endDate ?: LocalDate.now()
                    ).sumOf { it.amount }
                }
                
                val percentageUsed = if (budget.amount > BigDecimal.ZERO) {
                    (spentAmount.toDouble() / budget.amount.toDouble()) * 100
                } else 0.0
                
                percentageUsed >= 100
            }
        
        if (overBudgetCount > 0) {
            insights.add("You have $overBudgetCount budget(s) that are over the limit")
        }
        
        return FinancialInsightsResponse(
            insights = insights,
            spendingChangePercentage = spendingChange,
            topSpendingCategory = topCategory?.key ?: "No data",
            recommendedSavings = currentMonthExpenses * BigDecimal("0.2") // Suggest saving 20% of expenses
        )
    }
}

// DTOs for Analytics
data class SpendingAnalyticsResponse(
    val totalIncome: BigDecimal,
    val totalExpenses: BigDecimal,
    val netSavings: BigDecimal,
    val categoryBreakdown: List<CategorySpendingDto>,
    val period: String
)

data class CategorySpendingDto(
    val categoryName: String,
    val amount: BigDecimal,
    val percentage: Double,
    val transactionCount: Int,
    val color: String
)

data class MonthlyTrendsResponse(
    val trends: List<MonthlyTrendDto>
)

data class MonthlyTrendDto(
    val month: String,
    val income: BigDecimal,
    val expenses: BigDecimal,
    val savings: BigDecimal
)

data class BudgetAnalyticsResponse(
    val totalBudgets: Int,
    val totalBudgetAmount: BigDecimal,
    val totalSpent: BigDecimal,
    val budgetsOnTrack: Int,
    val budgetsOverBudget: Int,
    val budgetProgress: List<BudgetProgressDto>
)

data class BudgetProgressDto(
    val budgetId: Long,
    val budgetName: String,
    val categoryName: String?,
    val budgetAmount: BigDecimal,
    val spentAmount: BigDecimal,
    val remainingAmount: BigDecimal,
    val percentageUsed: Double,
    val daysRemaining: Int,
    val status: String
)

data class GoalAnalyticsResponse(
    val totalGoals: Int,
    val completedGoals: Int,
    val totalTargetAmount: BigDecimal,
    val totalSavedAmount: BigDecimal,
    val averageProgress: Double,
    val goalProgress: List<GoalProgressDto>
)

data class GoalProgressDto(
    val goalId: Long,
    val goalName: String,
    val targetAmount: BigDecimal,
    val currentAmount: BigDecimal,
    val remainingAmount: BigDecimal,
    val percentageComplete: Double,
    val daysRemaining: Int,
    val category: String,
    val isCompleted: Boolean
)

data class AccountAnalyticsResponse(
    val totalBalance: BigDecimal,
    val totalAccounts: Int,
    val accountBreakdown: List<AccountBalanceDto>
)


data class FinancialInsightsResponse(
    val insights: List<String>,
    val spendingChangePercentage: Double,
    val topSpendingCategory: String,
    val recommendedSavings: BigDecimal
)
