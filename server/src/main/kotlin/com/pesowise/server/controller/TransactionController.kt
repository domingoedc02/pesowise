package com.pesowise.server.controller

import com.pesowise.server.domain.entity.TransactionType
import com.pesowise.server.dto.*
import com.pesowise.server.service.TransactionService
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/transactions")
class TransactionController(
    private val transactionService: TransactionService
) {
    
    @GetMapping
    fun getTransactions(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication
    ): ResponseEntity<PaginatedResponse<TransactionDto>> {
        val userId = authentication.name
        val pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending())
        val transactions = transactionService.getTransactions(userId, pageable)
        return ResponseEntity.ok(transactions)
    }
    
    @GetMapping("/account/{accountId}")
    fun getTransactionsByAccount(
        @PathVariable accountId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication
    ): ResponseEntity<PaginatedResponse<TransactionDto>> {
        val userId = authentication.name
        val pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending())
        val transactions = transactionService.getTransactionsByAccount(userId, accountId, pageable)
        return ResponseEntity.ok(transactions)
    }
    
    @GetMapping("/category/{categoryId}")
    fun getTransactionsByCategory(
        @PathVariable categoryId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication
    ): ResponseEntity<PaginatedResponse<TransactionDto>> {
        val userId = authentication.name
        val pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending())
        val transactions = transactionService.getTransactionsByCategory(userId, categoryId, pageable)
        return ResponseEntity.ok(transactions)
    }
    
    @GetMapping("/date-range")
    fun getTransactionsByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        authentication: Authentication
    ): ResponseEntity<List<TransactionDto>> {
        val userId = authentication.name
        val transactions = transactionService.getTransactionsByDateRange(userId, startDate, endDate)
        return ResponseEntity.ok(transactions)
    }
    
    @GetMapping("/search")
    fun searchTransactions(
        @RequestParam search: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication
    ): ResponseEntity<PaginatedResponse<TransactionDto>> {
        val userId = authentication.name
        val pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending())
        val transactions = transactionService.searchTransactions(userId, search, pageable)
        return ResponseEntity.ok(transactions)
    }
    
    @GetMapping("/{id}")
    fun getTransactionById(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<TransactionDto> {
        val userId = authentication.name
        val transaction = transactionService.getTransactionById(userId, id)
        return ResponseEntity.ok(transaction)
    }
    
    @PostMapping
    fun createTransaction(
        @Valid @RequestBody request: CreateTransactionRequest,
        authentication: Authentication
    ): ResponseEntity<TransactionDto> {
        val userId = authentication.name
        val transaction = transactionService.createTransaction(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction)
    }
    
    @PutMapping("/{id}")
    fun updateTransaction(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateTransactionRequest,
        authentication: Authentication
    ): ResponseEntity<TransactionDto> {
        val userId = authentication.name
        val transaction = transactionService.updateTransaction(userId, id, request)
        return ResponseEntity.ok(transaction)
    }
    
    @DeleteMapping("/{id}")
    fun deleteTransaction(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.name
        transactionService.deleteTransaction(userId, id)
        return ResponseEntity.noContent().build()
    }
    
    @GetMapping("/monthly-income")
    fun getMonthlyIncome(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) month: LocalDate,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = authentication.name
        val income = transactionService.getMonthlyIncome(userId, month)
        return ResponseEntity.ok(mapOf("monthlyIncome" to income))
    }
    
    @GetMapping("/monthly-expenses")
    fun getMonthlyExpenses(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) month: LocalDate,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = authentication.name
        val expenses = transactionService.getMonthlyExpenses(userId, month)
        return ResponseEntity.ok(mapOf("monthlyExpenses" to expenses))
    }
    
    @GetMapping("/category-breakdown")
    fun getCategoryBreakdown(
        @RequestParam type: TransactionType,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        authentication: Authentication
    ): ResponseEntity<List<CategoryBreakdownDto>> {
        val userId = authentication.name
        val breakdown = transactionService.getCategoryBreakdown(userId, type, startDate, endDate)
        return ResponseEntity.ok(breakdown)
    }
}
