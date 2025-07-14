package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.GoalContribution
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface GoalContributionRepository : JpaRepository<GoalContribution, Long> {
    fun findByGoalIdOrderByContributionDateDesc(goalId: Long): List<GoalContribution>
    
    @Query("SELECT SUM(gc.amount) FROM GoalContribution gc WHERE gc.goal.id = :goalId")
    fun getTotalContributions(goalId: Long): BigDecimal?
    
    @Query("SELECT gc FROM GoalContribution gc WHERE gc.goal.user.id = :userId ORDER BY gc.createdAt DESC")
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<GoalContribution>
}
