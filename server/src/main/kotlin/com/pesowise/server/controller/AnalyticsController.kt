package com.pesowise.server.controller

import com.pesowise.server.service.AnalyticsService
import com.pesowise.server.service.*
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/analytics")
class AnalyticsController(
    private val analyticsService: AnalyticsService
) {

    @GetMapping("/spending")
    fun getSpendingAnalytics(
        authentication: Authentication,
        @RequestParam(defaultValue = "30") days: Int
    ): ResponseEntity<SpendingAnalyticsResponse> {
        val userId = authentication.name
        val endDate = LocalDate.now()
        val startDate = endDate.minusDays(days.toLong())
        
        val analytics = analyticsService.getSpendingAnalytics(userId, startDate, endDate)
        return ResponseEntity.ok(analytics)
    }

    @GetMapping("/spending/custom")
    fun getSpendingAnalyticsCustomRange(
        authentication: Authentication,
        @RequestParam startDate: String,
        @RequestParam endDate: String
    ): ResponseEntity<SpendingAnalyticsResponse> {
        val userId = authentication.name
        val start = LocalDate.parse(startDate)
        val end = LocalDate.parse(endDate)
        
        val analytics = analyticsService.getSpendingAnalytics(userId, start, end)
        return ResponseEntity.ok(analytics)
    }

    @GetMapping("/trends")
    fun getMonthlyTrends(
        authentication: Authentication,
        @RequestParam(defaultValue = "6") months: Int
    ): ResponseEntity<MonthlyTrendsResponse> {
        val userId = authentication.name
        val trends = analyticsService.getMonthlyTrends(userId, months)
        return ResponseEntity.ok(trends)
    }

    @GetMapping("/budgets")
    fun getBudgetAnalytics(
        authentication: Authentication
    ): ResponseEntity<BudgetAnalyticsResponse> {
        val userId = authentication.name
        val analytics = analyticsService.getBudgetAnalytics(userId)
        return ResponseEntity.ok(analytics)
    }

    @GetMapping("/goals")
    fun getGoalAnalytics(
        authentication: Authentication
    ): ResponseEntity<GoalAnalyticsResponse> {
        val userId = authentication.name
        val analytics = analyticsService.getGoalAnalytics(userId)
        return ResponseEntity.ok(analytics)
    }

    @GetMapping("/accounts")
    fun getAccountAnalytics(
        authentication: Authentication
    ): ResponseEntity<AccountAnalyticsResponse> {
        val userId = authentication.name
        val analytics = analyticsService.getAccountAnalytics(userId)
        return ResponseEntity.ok(analytics)
    }

    @GetMapping("/insights")
    fun getFinancialInsights(
        authentication: Authentication
    ): ResponseEntity<FinancialInsightsResponse> {
        val userId = authentication.name
        val insights = analyticsService.getFinancialInsights(userId)
        return ResponseEntity.ok(insights)
    }

    @GetMapping("/summary")
    fun getAnalyticsSummary(
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = authentication.name
        
        val spending = analyticsService.getSpendingAnalytics(
            userId, 
            LocalDate.now().minusDays(30), 
            LocalDate.now()
        )
        val budgets = analyticsService.getBudgetAnalytics(userId)
        val goals = analyticsService.getGoalAnalytics(userId)
        val accounts = analyticsService.getAccountAnalytics(userId)
        val insights = analyticsService.getFinancialInsights(userId)
        
        val summary = mapOf(
            "spending" to spending,
            "budgets" to budgets,
            "goals" to goals,
            "accounts" to accounts,
            "insights" to insights
        )
        
        return ResponseEntity.ok(summary)
    }
}
