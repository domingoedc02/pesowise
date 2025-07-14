package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.EmailVerification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface EmailVerificationRepository : JpaRepository<EmailVerification, Long> {
    fun findByEmailAndOtpCode(email: String, otpCode: String): Optional<EmailVerification>
    
    @Query("SELECT ev FROM EmailVerification ev WHERE ev.email = ?1 AND ev.isVerified = false AND ev.expiresAt > ?2 ORDER BY ev.createdAt DESC")
    fun findLatestActiveByEmail(email: String, currentTime: LocalDateTime = LocalDateTime.now()): Optional<EmailVerification>
    
    @Query("DELETE FROM EmailVerification ev WHERE ev.expiresAt < ?1")
    fun deleteExpiredVerifications(currentTime: LocalDateTime = LocalDateTime.now())
    
    fun deleteByEmail(email: String)
}
