package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "user_settings")
data class UserSettings(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    val user: User,
    
    @Column(name = "currency_code", length = 3)
    var currencyCode: String = "USD",
    
    @Enumerated(EnumType.STRING)
    var theme: Theme = Theme.SYSTEM,
    
    var language: String = "en",
    
    @Column(name = "notifications_enabled")
    var notificationsEnabled: Boolean = true,
    
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

enum class Theme {
    LIGHT,
    DARK,
    SYSTEM
}
