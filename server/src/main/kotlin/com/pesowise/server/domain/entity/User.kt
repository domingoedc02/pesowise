package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "users")
data class User(
    @Id
    val id: String = UUID.randomUUID().toString(),
    
    @Column(nullable = false, unique = true)
    val email: String,
    
    @Column(unique = true)
    var username: String? = null,
    
    var password: String? = null,
    
    @Column(name = "first_name")
    var firstName: String? = null,
    
    @Column(name = "last_name")
    var lastName: String? = null,
    
    @Column(name = "date_of_birth")
    var dateOfBirth: LocalDate? = null,
    
    var gender: String? = null,
    
    @Column(name = "profile_image_url")
    var profileImageUrl: String? = null,
    
    @Column(name = "is_email_verified")
    var isEmailVerified: Boolean = false,
    
    @Column(name = "is_profile_complete")
    var isProfileComplete: Boolean = false,
    
    @Column(name = "is_active")
    var isActive: Boolean = true,
    
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "last_login_at")
    var lastLoginAt: LocalDateTime? = null,
    
    @OneToOne(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var settings: UserSettings? = null
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
    
    fun getFullName(): String? {
        return if (!firstName.isNullOrBlank() && !lastName.isNullOrBlank()) {
            "$firstName $lastName"
        } else {
            firstName ?: lastName
        }
    }
}
