package com.pesowise.server.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.util.UUID

// Registration DTOs
data class RegisterRequest(
    @field:Email(message = "Invalid email format")
    @field:NotBlank(message = "Email is required")
    val email: String
)

data class VerifyOtpRequest(
    @field:Email(message = "Invalid email format")
    @field:NotBlank(message = "Email is required")
    val email: String,
    
    @field:NotBlank(message = "OTP code is required")
    @field:Size(min = 6, max = 6, message = "OTP code must be 6 digits")
    val otpCode: String
)

data class CompleteProfileRequest(
    @field:Email(message = "Invalid email format")
    @field:NotBlank(message = "Email is required")
    val email: String,
    
    @field:NotBlank(message = "Username is required")
    @field:Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    val username: String,
    
    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    val password: String,
    
    @field:NotBlank(message = "First name is required")
    val firstName: String,
    
    @field:NotBlank(message = "Last name is required")
    val lastName: String,
    
    @field:Past(message = "Date of birth must be in the past")
    val dateOfBirth: LocalDate,
    
    @field:NotBlank(message = "Gender is required")
    val gender: String
)

// Login DTOs
data class LoginRequest(
    @field:NotBlank(message = "Username or email is required")
    val usernameOrEmail: String,
    
    @field:NotBlank(message = "Password is required")
    val password: String
)

data class RefreshTokenRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

// Password Reset DTOs
data class ForgotPasswordRequest(
    @field:Email(message = "Invalid email format")
    @field:NotBlank(message = "Email is required")
    val email: String
)

data class ResetPasswordRequest(
    @field:NotBlank(message = "Token is required")
    val token: String,
    
    @field:NotBlank(message = "New password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    val newPassword: String
)

// Response DTOs
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val user: UserDto
)

data class UserDto(
    val id: String,
    val email: String,
    val username: String?,
    val firstName: String?,
    val lastName: String?,
    val profileImageUrl: String?,
    val isEmailVerified: Boolean,
    val isProfileComplete: Boolean,
    val settings: UserSettingsDto?
)

data class UserSettingsDto(
    val currencyCode: String,
    val theme: String,
    val language: String,
    val notificationsEnabled: Boolean
)

data class MessageResponse(
    val message: String,
    val success: Boolean = true
)

data class ErrorResponse(
    val message: String,
    val errors: Map<String, String>? = null,
    val timestamp: Long = System.currentTimeMillis()
)
