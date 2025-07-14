package com.pesowise.server.controller

import com.pesowise.server.dto.*
import com.pesowise.server.service.*
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val accountService: AccountService,
    private val transactionService: TransactionService,
    private val budgetService: BudgetService,
    private val goalService: GoalService,
    private val notificationService: NotificationService
) {
    
    @GetMapping("/summary")
    fun getDashboardSummary(authentication: Authentication): ResponseEntity<DashboardSummaryDto> {
        val userId = authentication.name
        val currentMonth = LocalDate.now()
        
        // Get financial summary
        val totalBalance = accountService.getTotalBalance(userId)
        val monthlyIncome = transactionService.getMonthlyIncome(userId, currentMonth)
        val monthlyExpenses = transactionService.getMonthlyExpenses(userId, currentMonth)
        val savingsRate = if (monthlyIncome > java.math.BigDecimal.ZERO) {
            ((monthlyIncome - monthlyExpenses).divide(monthlyIncome, 4, java.math.BigDecimal.ROUND_HALF_UP) * java.math.BigDecimal("100")).toDouble()
        } else 0.0
        
        // Get goal summary
        val goalSummary = goalService.getGoalSummary(userId)
        val activeGoals = goalSummary["activeGoals"] as Long
        val completedGoals = goalSummary["completedGoals"] as Long
        
        // Get active budgets count
        val activeBudgets = budgetService.getAllBudgets(userId).count { it.isActive }
        
        // Get recent transactions
        val recentTransactions = transactionService.getTransactions(
            userId, 
            org.springframework.data.domain.PageRequest.of(0, 10)
        ).content
        
        val summary = DashboardSummaryDto(
            totalBalance = totalBalance,
            monthlyIncome = monthlyIncome,
            monthlyExpenses = monthlyExpenses,
            savingsRate = savingsRate,
            activeGoals = activeGoals.toInt(),
            completedGoals = completedGoals.toInt(),
            activeBudgets = activeBudgets,
            recentTransactions = recentTransactions
        )
        
        return ResponseEntity.ok(summary)
    }
    
    @GetMapping("/quick-stats")
    fun getQuickStats(authentication: Authentication): ResponseEntity<Map<String, Any>> {
        val userId = authentication.name
        
        val stats = mapOf<String, Any>(
            "totalBalance" to accountService.getTotalBalance(userId),
            "accountCount" to accountService.getAllAccounts(userId).size,
            "unreadNotifications" to notificationService.getUnreadCount(userId),
            "goalProgress" to (goalService.getGoalSummary(userId)["overallProgress"] ?: 0.0)
        )
        
        return ResponseEntity.ok(stats)
    }
}
