package com.pesowise.server.dto

import java.time.LocalDate
import java.util.UUID

data class UserProfileResponse(
    val id: String,
    val email: String,
    val username: String?,
    val firstName: String?,
    val lastName: String?,
    val dateOfBirth: LocalDate?,
    val gender: String?,
    val profileImageUrl: String?,
    val currency: String?,
    val theme: String?,
    val notifications: Boolean,
    val isEmailVerified: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class UpdateUserProfileRequest(
    val username: String?,
    val firstName: String?,
    val lastName: String?,
    val dateOfBirth: LocalDate?,
    val gender: String?
)

data class UpdateUserSettingsRequest(
    val currency: String?,
    val theme: String?,
    val notifications: Boolean?
)

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

data class UploadProfileImageResponse(
    val profileImageUrl: String
)

// Currency data
data class CurrencyResponse(
    val code: String,
    val name: String,
    val symbol: String,
    val decimalPlaces: Int
)
