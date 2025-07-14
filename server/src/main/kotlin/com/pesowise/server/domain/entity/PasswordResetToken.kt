package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "password_reset_tokens")
data class PasswordResetToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(nullable = false, unique = true)
    val token: String,
    
    @Column(name = "expires_at", nullable = false)
    val expiresAt: LocalDateTime,
    
    @Column(name = "is_used")
    var isUsed: Boolean = false,
    
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    fun isExpired(): Boolean {
        return LocalDateTime.now().isAfter(expiresAt)
    }
    
    fun isValid(): Boolean {
        return !isExpired() && !isUsed
    }
}
