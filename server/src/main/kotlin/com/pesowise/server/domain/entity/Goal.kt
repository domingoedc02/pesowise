package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "goals")
data class Goal(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false, length = 100)
    var name: String,

    @Column(name = "target_amount", nullable = false, precision = 15, scale = 2)
    var targetAmount: BigDecimal,

    @Column(name = "current_amount", nullable = false, precision = 15, scale = 2)
    var currentAmount: BigDecimal = BigDecimal.ZERO,

    @Column(name = "target_date", nullable = false)
    var targetDate: LocalDate,

    @Column(length = 50)
    @Enumerated(EnumType.STRING)
    var category: GoalCategory? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(length = 50)
    var icon: String? = null,

    @Column(length = 7)
    var color: String? = null,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "is_completed", nullable = false)
    var isCompleted: Boolean = false,

    @Column(name = "completed_at")
    var completedAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
        
        // Auto-complete goal when target amount is reached
        if (currentAmount >= targetAmount && !isCompleted) {
            isCompleted = true
            completedAt = LocalDateTime.now()
        }
    }
}

enum class GoalCategory {
    EMERGENCY,
    VACATION,
    PURCHASE,
    INVESTMENT,
    OTHER
}
