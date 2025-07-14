package com.pesowise.server.service

import com.pesowise.server.domain.entity.Goal
import com.pesowise.server.domain.entity.GoalContribution
import com.pesowise.server.domain.entity.GoalCategory
import com.pesowise.server.domain.entity.NotificationType
import com.pesowise.server.domain.repository.*
import com.pesowise.server.dto.*
import com.pesowise.server.dto.GoalProgressDto
import com.pesowise.server.exception.ResourceNotFoundException
import com.pesowise.server.exception.BadRequestException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

@Service
@Transactional
class GoalService(
    private val goalRepository: GoalRepository,
    private val goalContributionRepository: GoalContributionRepository,
    private val accountRepository: AccountRepository,
    private val userRepository: UserRepository,
    private val accountService: AccountService,
    private val notificationService: NotificationService,
    private val auditService: AuditService
) {
    
    fun getAllGoals(userId: String): List<GoalDto> {
        val goals = goalRepository.findByUserIdAndIsActiveTrue(userId)
        return goals.map { it.toDto() }
    }
    
    fun getActiveGoals(userId: String): List<GoalDto> {
        val goals = goalRepository.findByUserIdAndIsActiveTrueAndIsCompletedFalse(userId)
        return goals.map { it.toDto() }
    }
    
    fun getCompletedGoals(userId: String): List<GoalDto> {
        val goals = goalRepository.findByUserIdAndIsActiveTrueAndIsCompletedTrue(userId)
        return goals.map { it.toDto() }
    }
    
    fun getGoalsByCategory(userId: String, category: GoalCategory): List<GoalDto> {
        val goals = goalRepository.findByUserIdAndCategoryAndIsActiveTrue(userId, category)
        return goals.map { it.toDto() }
    }
    
    fun getGoalById(userId: String, goalId: Long): GoalDto {
        val goal = goalRepository.findByUserIdAndId(userId, goalId)
            ?: throw ResourceNotFoundException("Goal not found")
        return goal.toDto()
    }
    
    fun createGoal(userId: String, request: CreateGoalRequest): GoalDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        val goal = Goal(
            user = user,
            name = request.name,
            targetAmount = request.targetAmount,
            targetDate = request.targetDate,
            category = request.category,
            description = request.description,
            icon = request.icon,
            color = request.color
        )
        
        val savedGoal = goalRepository.save(goal)
        auditService.logUserAction(user.id, "goal_created", "Created goal: ${savedGoal.name}")
        
        return savedGoal.toDto()
    }
    
    fun updateGoal(userId: String, goalId: Long, request: UpdateGoalRequest): GoalDto {
        val goal = goalRepository.findByUserIdAndId(userId, goalId)
            ?: throw ResourceNotFoundException("Goal not found")
        
        if (goal.isCompleted) {
            throw BadRequestException("Cannot update completed goal")
        }
        
        request.name?.let { goal.name = it }
        request.targetAmount?.let { goal.targetAmount = it }
        request.targetDate?.let { goal.targetDate = it }
        request.description?.let { goal.description = it }
        request.icon?.let { goal.icon = it }
        request.color?.let { goal.color = it }
        request.isActive?.let { goal.isActive = it }
        
        val updatedGoal = goalRepository.save(goal)
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "goal_updated", "Updated goal: ${updatedGoal.name}")
        
        return updatedGoal.toDto()
    }
    
    fun deleteGoal(userId: String, goalId: Long) {
        val goal = goalRepository.findByUserIdAndId(userId, goalId)
            ?: throw ResourceNotFoundException("Goal not found")
        
        goal.isActive = false
        goalRepository.save(goal)
        
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "goal_deleted", "Deleted goal: ${goal.name}")
    }
    
    fun contributeToGoal(userId: String, goalId: Long, request: CreateGoalContributionRequest): GoalContributionDto {
        val goal = goalRepository.findByUserIdAndId(userId, goalId)
            ?: throw ResourceNotFoundException("Goal not found")
        
        if (goal.isCompleted) {
            throw BadRequestException("Cannot contribute to completed goal")
        }
        
        val account = accountRepository.findByUserIdAndId(userId, request.accountId)
            ?: throw ResourceNotFoundException("Account not found")
        
        if (account.balance < request.amount) {
            throw BadRequestException("Insufficient balance in account")
        }
        
        // Create contribution
        val contribution = GoalContribution(
            goal = goal,
            account = account,
            amount = request.amount,
            contributionDate = request.contributionDate,
            notes = request.notes
        )
        
        val savedContribution = goalContributionRepository.save(contribution)
        
        // Update goal current amount
        goal.currentAmount = goal.currentAmount.add(request.amount)
        val updatedGoal = goalRepository.save(goal)
        
        // Update account balance
        accountService.adjustAccountBalance(account.id, request.amount, "SUBTRACT")
        
        // Check if goal is completed
        if (updatedGoal.currentAmount >= updatedGoal.targetAmount && !updatedGoal.isCompleted) {
            updatedGoal.isCompleted = true
            updatedGoal.completedAt = LocalDateTime.now()
            goalRepository.save(updatedGoal)
            
            // Send notification
            notificationService.createNotification(
                userId = userId,
                type = NotificationType.GOAL_MILESTONE,
                title = "Goal Completed: ${updatedGoal.name}",
                message = "Congratulations! You've reached your goal of ${updatedGoal.targetAmount}",
                data = mapOf<String, Any>(
                    "goalId" to updatedGoal.id,
                    "goalName" to updatedGoal.name,
                    "targetAmount" to updatedGoal.targetAmount,
                    "completedAt" to updatedGoal.completedAt.toString()
                )
            )
        } else {
            // Check milestones (25%, 50%, 75%)
            val percentageComplete = (updatedGoal.currentAmount.divide(updatedGoal.targetAmount, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
            val milestones = listOf(25.0, 50.0, 75.0)
            val previousPercentage = ((updatedGoal.currentAmount.subtract(request.amount)).divide(updatedGoal.targetAmount, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
            
            milestones.forEach { milestone ->
                if (previousPercentage < milestone && percentageComplete >= milestone) {
                    notificationService.createNotification(
                        userId = userId,
                        type = NotificationType.GOAL_MILESTONE,
                        title = "Goal Milestone: ${updatedGoal.name}",
                        message = "You've reached ${milestone.toInt()}% of your goal!",
                        data = mapOf<String, Any>(
                            "goalId" to updatedGoal.id,
                            "goalName" to updatedGoal.name,
                            "milestone" to milestone,
                            "currentAmount" to updatedGoal.currentAmount,
                            "targetAmount" to updatedGoal.targetAmount
                        )
                    )
                }
            }
        }
        
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "goal_contribution", 
            "Contributed ${request.amount} to goal: ${goal.name}")
        
        return savedContribution.toDto()
    }
    
    fun getGoalContributions(userId: String, goalId: Long): List<GoalContributionDto> {
        val goal = goalRepository.findByUserIdAndId(userId, goalId)
            ?: throw ResourceNotFoundException("Goal not found")
        
        val contributions = goalContributionRepository.findByGoalIdOrderByContributionDateDesc(goalId)
        return contributions.map { it.toDto() }
    }
    
    fun getGoalProgress(userId: String, goalId: Long): GoalProgressDto {
        val goal = goalRepository.findByUserIdAndId(userId, goalId)
            ?: throw ResourceNotFoundException("Goal not found")
        
        val contributions = goalContributionRepository.findByGoalIdOrderByContributionDateDesc(goalId)
        val goalDto = goal.toDto()
        
        // Calculate monthly contribution needed
        val monthsRemaining = ChronoUnit.MONTHS.between(LocalDate.now(), goal.targetDate)
        val amountRemaining = goal.targetAmount - goal.currentAmount
        val monthlyContributionNeeded = if (monthsRemaining > 0 && amountRemaining > BigDecimal.ZERO) {
            amountRemaining.divide(BigDecimal(monthsRemaining), 2, BigDecimal.ROUND_HALF_UP)
        } else null
        
        return GoalProgressDto(
            goal = goalDto,
            contributions = contributions.map { it.toDto() },
            monthlyContributionNeeded = monthlyContributionNeeded
        )
    }
    
    fun getGoalSummary(userId: String): Map<String, Any> {
        val activeGoals = goalRepository.countByUserIdAndIsActiveTrueAndIsCompletedFalse(userId)
        val completedGoals = goalRepository.countByUserIdAndIsActiveTrueAndIsCompletedTrue(userId)
        val totalTargetAmount = goalRepository.getTotalTargetAmount(userId) ?: BigDecimal.ZERO
        val totalSavedAmount = goalRepository.getTotalSavedAmount(userId) ?: BigDecimal.ZERO
        
        return mapOf(
            "activeGoals" to activeGoals,
            "completedGoals" to completedGoals,
            "totalTargetAmount" to totalTargetAmount,
            "totalSavedAmount" to totalSavedAmount,
            "overallProgress" to if (totalTargetAmount > BigDecimal.ZERO) {
                (totalSavedAmount.divide(totalTargetAmount, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
            } else 0.0
        )
    }
    
    private fun Goal.toDto(): GoalDto {
        val daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), targetDate)
        val percentageComplete = if (targetAmount > BigDecimal.ZERO) {
            (currentAmount.divide(targetAmount, 4, BigDecimal.ROUND_HALF_UP) * BigDecimal("100")).toDouble()
        } else 0.0
        
        return GoalDto(
            id = id,
            name = name,
            targetAmount = targetAmount,
            currentAmount = currentAmount,
            targetDate = targetDate,
            category = category,
            description = description,
            icon = icon,
            color = color,
            isActive = isActive,
            isCompleted = isCompleted,
            completedAt = completedAt,
            percentageComplete = percentageComplete,
            daysRemaining = if (daysRemaining > 0) daysRemaining else null
        )
    }
    
    private fun GoalContribution.toDto() = GoalContributionDto(
        id = id,
        goalId = goal.id,
        goalName = goal.name,
        accountId = account.id,
        accountName = account.name,
        amount = amount,
        contributionDate = contributionDate,
        notes = notes
    )
}
