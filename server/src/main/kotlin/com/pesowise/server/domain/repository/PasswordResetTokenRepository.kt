package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.PasswordResetToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

@Repository
interface PasswordResetTokenRepository : JpaRepository<PasswordResetToken, Long> {
    fun findByToken(token: String): Optional<PasswordResetToken>
    
    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.user.id = ?1 AND prt.isUsed = false AND prt.expiresAt > ?2")
    fun findActiveTokenByUserId(userId: Long, currentTime: LocalDateTime = LocalDateTime.now()): Optional<PasswordResetToken>
    
    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.expiresAt < ?1")
    fun deleteExpiredTokens(currentTime: LocalDateTime = LocalDateTime.now())
    
    @Modifying
    @Query("UPDATE PasswordResetToken prt SET prt.isUsed = true WHERE prt.user.id = ?1 AND prt.isUsed = false")
    fun invalidateAllUserTokens(userId: String)
}
