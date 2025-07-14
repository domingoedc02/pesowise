package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.Goal
import com.pesowise.server.domain.entity.GoalCategory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface GoalRepository : JpaRepository<Goal, Long> {
    fun findByUserIdAndIsActiveTrue(userId: String): List<Goal>
    
    fun findByUserIdAndId(userId: String, id: Long): Goal?
    
    fun findByUserIdAndIsActiveTrueAndIsCompletedFalse(userId: String): List<Goal>
    
    fun findByUserIdAndIsActiveTrueAndIsCompletedTrue(userId: String): List<Goal>
    
    fun findByUserIdAndCategoryAndIsActiveTrue(userId: String, category: GoalCategory): List<Goal>
    
    @Query("SELECT SUM(g.targetAmount) FROM Goal g WHERE g.user.id = :userId AND g.isActive = true AND g.isCompleted = false")
    fun getTotalTargetAmount(userId: String): BigDecimal?
    
    @Query("SELECT SUM(g.currentAmount) FROM Goal g WHERE g.user.id = :userId AND g.isActive = true")
    fun getTotalSavedAmount(userId: String): BigDecimal?
    
    fun countByUserIdAndIsActiveTrueAndIsCompletedFalse(userId: String): Long
    
    fun countByUserIdAndIsActiveTrueAndIsCompletedTrue(userId: String): Long
}
