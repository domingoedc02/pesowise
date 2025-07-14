package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notifications")
data class Notification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    var type: NotificationType,

    @Column(nullable = false, length = 200)
    var title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var message: String,

    @Column(columnDefinition = "JSONB")
    var data: String? = null,

    @Column(name = "is_read", nullable = false)
    var isRead: Boolean = false,

    @Column(name = "read_at")
    var readAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class NotificationType {
    BUDGET_ALERT,
    GOAL_MILESTONE,
    TRANSACTION_REMINDER,
    SYSTEM
}
