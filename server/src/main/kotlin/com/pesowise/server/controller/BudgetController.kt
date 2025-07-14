package com.pesowise.server.controller

import com.pesowise.server.dto.*
import com.pesowise.server.service.BudgetService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/budgets")
class BudgetController(
    private val budgetService: BudgetService
) {
    
    @GetMapping
    fun getAllBudgets(authentication: Authentication): ResponseEntity<List<BudgetDto>> {
        val userId = authentication.name
        val budgets = budgetService.getAllBudgets(userId)
        return ResponseEntity.ok(budgets)
    }
    
    @GetMapping("/{id}")
    fun getBudgetById(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<BudgetDto> {
        val userId = authentication.name
        val budget = budgetService.getBudgetById(userId, id)
        return ResponseEntity.ok(budget)
    }
    
    @PostMapping
    fun createBudget(
        @Valid @RequestBody request: CreateBudgetRequest,
        authentication: Authentication
    ): ResponseEntity<BudgetDto> {
        val userId = authentication.name
        val budget = budgetService.createBudget(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(budget)
    }
    
    @PutMapping("/{id}")
    fun updateBudget(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateBudgetRequest,
        authentication: Authentication
    ): ResponseEntity<BudgetDto> {
        val userId = authentication.name
        val budget = budgetService.updateBudget(userId, id, request)
        return ResponseEntity.ok(budget)
    }
    
    @DeleteMapping("/{id}")
    fun deleteBudget(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.name
        budgetService.deleteBudget(userId, id)
        return ResponseEntity.noContent().build()
    }
    
    @GetMapping("/{id}/progress")
    fun getBudgetProgress(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<BudgetProgressDto> {
        val userId = authentication.name
        val progress = budgetService.getBudgetProgress(userId, id)
        return ResponseEntity.ok(progress)
    }
}
