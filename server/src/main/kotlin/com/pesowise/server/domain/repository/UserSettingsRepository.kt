package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.UserSettings
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserSettingsRepository : JpaRepository<UserSettings, Long> {
    @Query("SELECT us FROM UserSettings us WHERE us.user.id = :userId")
    fun findByUserId(@Param("userId") userId: String): Optional<UserSettings>
}
