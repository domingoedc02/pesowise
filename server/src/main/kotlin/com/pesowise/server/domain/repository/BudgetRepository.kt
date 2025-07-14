package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.Budget
import com.pesowise.server.domain.entity.BudgetPeriod
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface BudgetRepository : JpaRepository<Budget, Long> {
    fun findByUserIdAndIsActiveTrue(userId: String): List<Budget>
    
    fun findByUserIdAndId(userId: String, id: Long): Budget?
    
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.isActive = true AND b.startDate <= :date AND (b.endDate IS NULL OR b.endDate >= :date)")
    fun findActiveBudgetsForDate(userId: String, date: LocalDate): List<Budget>
    
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category.id = :categoryId AND b.isActive = true AND b.startDate <= :date AND (b.endDate IS NULL OR b.endDate >= :date)")
    fun findActiveBudgetForCategory(userId: String, categoryId: Long, date: LocalDate): Budget?
    
    fun findByUserIdAndPeriodAndIsActiveTrue(userId: String, period: BudgetPeriod): List<Budget>
    
    fun countByUserIdAndIsActiveTrue(userId: String): Long
}
