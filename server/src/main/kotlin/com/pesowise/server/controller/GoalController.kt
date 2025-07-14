package com.pesowise.server.controller

import com.pesowise.server.domain.entity.GoalCategory
import com.pesowise.server.dto.*
import com.pesowise.server.service.GoalService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/goals")
class GoalController(
    private val goalService: GoalService
) {
    
    @GetMapping
    fun getAllGoals(authentication: Authentication): ResponseEntity<List<GoalDto>> {
        val userId = authentication.name
        val goals = goalService.getAllGoals(userId)
        return ResponseEntity.ok(goals)
    }
    
    @GetMapping("/active")
    fun getActiveGoals(authentication: Authentication): ResponseEntity<List<GoalDto>> {
        val userId = authentication.name
        val goals = goalService.getActiveGoals(userId)
        return ResponseEntity.ok(goals)
    }
    
    @GetMapping("/completed")
    fun getCompletedGoals(authentication: Authentication): ResponseEntity<List<GoalDto>> {
        val userId = authentication.name
        val goals = goalService.getCompletedGoals(userId)
        return ResponseEntity.ok(goals)
    }
    
    @GetMapping("/category/{category}")
    fun getGoalsByCategory(
        @PathVariable category: GoalCategory,
        authentication: Authentication
    ): ResponseEntity<List<GoalDto>> {
        val userId = authentication.name
        val goals = goalService.getGoalsByCategory(userId, category)
        return ResponseEntity.ok(goals)
    }
    
    @GetMapping("/{id}")
    fun getGoalById(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<GoalDto> {
        val userId = authentication.name
        val goal = goalService.getGoalById(userId, id)
        return ResponseEntity.ok(goal)
    }
    
    @PostMapping
    fun createGoal(
        @Valid @RequestBody request: CreateGoalRequest,
        authentication: Authentication
    ): ResponseEntity<GoalDto> {
        val userId = authentication.name
        val goal = goalService.createGoal(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(goal)
    }
    
    @PutMapping("/{id}")
    fun updateGoal(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateGoalRequest,
        authentication: Authentication
    ): ResponseEntity<GoalDto> {
        val userId = authentication.name
        val goal = goalService.updateGoal(userId, id, request)
        return ResponseEntity.ok(goal)
    }
    
    @DeleteMapping("/{id}")
    fun deleteGoal(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.name
        goalService.deleteGoal(userId, id)
        return ResponseEntity.noContent().build()
    }
    
    @PostMapping("/{id}/contribute")
    fun contributeToGoal(
        @PathVariable id: Long,
        @Valid @RequestBody request: CreateGoalContributionRequest,
        authentication: Authentication
    ): ResponseEntity<GoalContributionDto> {
        val userId = authentication.name
        val contribution = goalService.contributeToGoal(userId, id, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(contribution)
    }
    
    @GetMapping("/{id}/contributions")
    fun getGoalContributions(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<List<GoalContributionDto>> {
        val userId = authentication.name
        val contributions = goalService.getGoalContributions(userId, id)
        return ResponseEntity.ok(contributions)
    }
    
    @GetMapping("/{id}/progress")
    fun getGoalProgress(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<GoalProgressDto> {
        val userId = authentication.name
        val progress = goalService.getGoalProgress(userId, id)
        return ResponseEntity.ok(progress)
    }
    
    @GetMapping("/summary")
    fun getGoalSummary(authentication: Authentication): ResponseEntity<Map<String, Any>> {
        val userId = authentication.name
        val summary = goalService.getGoalSummary(userId)
        return ResponseEntity.ok(summary)
    }
}
