package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.Transaction
import com.pesowise.server.domain.entity.TransactionType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate

@Repository
interface TransactionRepository : JpaRepository<Transaction, Long> {
    fun findByUserIdOrderByTransactionDateDesc(userId: String, pageable: Pageable): Page<Transaction>
    
    fun findByUserIdAndId(userId: String, id: Long): Transaction?
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    fun findByUserIdAndDateRange(userId: String, startDate: LocalDate, endDate: LocalDate): List<Transaction>
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.account.id = :accountId ORDER BY t.transactionDate DESC")
    fun findByUserIdAndAccountId(userId: String, accountId: Long, pageable: Pageable): Page<Transaction>
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.category.id = :categoryId ORDER BY t.transactionDate DESC")
    fun findByUserIdAndCategoryId(userId: String, categoryId: Long, pageable: Pageable): Page<Transaction>
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    fun getTotalByTypeAndDateRange(userId: String, type: TransactionType, startDate: LocalDate, endDate: LocalDate): BigDecimal?
    
    @Query("SELECT t.category.name, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate GROUP BY t.category.name ORDER BY SUM(t.amount) DESC")
    fun getCategoryBreakdown(userId: String, type: TransactionType, startDate: LocalDate, endDate: LocalDate): List<Array<Any>>
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId")
    fun countByUserId(userId: String): Long
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND (LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.category.name) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY t.transactionDate DESC")
    fun searchTransactions(@Param("userId") userId: String, @Param("search") search: String, pageable: Pageable): Page<Transaction>
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' AND t.transactionDate BETWEEN :startDate AND :endDate")
    fun findExpensesByUserAndDateRange(@Param("userId") userId: String, @Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Transaction>
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = 'INCOME' AND t.transactionDate BETWEEN :startDate AND :endDate")
    fun findIncomeByUserAndDateRange(@Param("userId") userId: String, @Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Transaction>
    
    fun findByUserId(@Param("userId") userId: String): List<Transaction>
    
    fun findByUserIdAndType(@Param("userId") userId: String, @Param("type") type: TransactionType): List<Transaction>
}
