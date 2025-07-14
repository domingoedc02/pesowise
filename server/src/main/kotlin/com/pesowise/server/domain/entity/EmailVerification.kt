package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "email_verifications")
data class EmailVerification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    val email: String,
    
    @Column(name = "otp_code", nullable = false, length = 6)
    val otpCode: String,
    
    @Column(name = "expires_at", nullable = false)
    val expiresAt: LocalDateTime,
    
    @Column(name = "is_verified")
    var isVerified: Boolean = false,
    
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    fun isExpired(): Boolean {
        return LocalDateTime.now().isAfter(expiresAt)
    }
    
    fun isValid(code: String): Boolean {
        return !isExpired() && !isVerified && otpCode == code
    }
}
