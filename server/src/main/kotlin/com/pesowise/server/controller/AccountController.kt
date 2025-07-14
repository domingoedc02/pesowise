package com.pesowise.server.controller

import com.pesowise.server.dto.*
import com.pesowise.server.dto.AccountBalanceDto
import com.pesowise.server.service.AccountService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/accounts")
class AccountController(
    private val accountService: AccountService
) {
    
    @GetMapping
    fun getAllAccounts(authentication: Authentication): ResponseEntity<List<AccountDto>> {
        val userId = authentication.name
        val accounts = accountService.getAllAccounts(userId)
        return ResponseEntity.ok(accounts)
    }
    
    @GetMapping("/{id}")
    fun getAccountById(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<AccountDto> {
        val userId = authentication.name
        val account = accountService.getAccountById(userId, id)
        return ResponseEntity.ok(account)
    }
    
    @PostMapping
    fun createAccount(
        @Valid @RequestBody request: CreateAccountRequest,
        authentication: Authentication
    ): ResponseEntity<AccountDto> {
        val userId = authentication.name
        val account = accountService.createAccount(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(account)
    }
    
    @PutMapping("/{id}")
    fun updateAccount(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateAccountRequest,
        authentication: Authentication
    ): ResponseEntity<AccountDto> {
        val userId = authentication.name
        val account = accountService.updateAccount(userId, id, request)
        return ResponseEntity.ok(account)
    }
    
    @DeleteMapping("/{id}")
    fun deleteAccount(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.name
        accountService.deleteAccount(userId, id)
        return ResponseEntity.noContent().build()
    }
    
    @GetMapping("/total-balance")
    fun getTotalBalance(authentication: Authentication): ResponseEntity<Map<String, Any>> {
        val userId = authentication.name
        val totalBalance = accountService.getTotalBalance(userId)
        return ResponseEntity.ok(mapOf("totalBalance" to totalBalance))
    }
//
//    @GetMapping("/balances")
//    fun getAccountBalances(authentication: Authentication): ResponseEntity<List<AccountBalanceDto>> {
//        val userId = authentication.name.toLong()
//        val balances = accountService.getAccountBalances(userId)
//        return ResponseEntity.ok(balances)
//    }
}
