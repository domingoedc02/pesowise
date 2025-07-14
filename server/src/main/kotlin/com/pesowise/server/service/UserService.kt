package com.pesowise.server.service

import com.pesowise.server.domain.entity.UserSettings
import com.pesowise.server.domain.entity.Theme
import com.pesowise.server.domain.repository.UserRepository
import com.pesowise.server.domain.repository.UserSettingsRepository
import com.pesowise.server.dto.*
import com.pesowise.server.exception.BadRequestException
import com.pesowise.server.exception.ResourceNotFoundException
import com.pesowise.server.exception.UnauthorizedException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class UserService(
    private val userRepository: UserRepository,
    private val userSettingsRepository: UserSettingsRepository,
    private val passwordEncoder: PasswordEncoder,
    private val auditService: AuditService
) {
    companion object {
        private const val UPLOAD_DIR = "uploads/profile-images"
        private val ALLOWED_IMAGE_TYPES = setOf("image/jpeg", "image/png", "image/gif", "image/webp")
        private const val MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    }

    private val dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    init {
        // Create upload directory if it doesn't exist
        Files.createDirectories(Paths.get(UPLOAD_DIR))
    }

    @Transactional(readOnly = true)
    fun getUserProfile(userId: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        val settings = userSettingsRepository.findByUserId(userId).orElse(null)
            ?: UserSettings(user = user, currencyCode = "USD", theme = Theme.SYSTEM, notificationsEnabled = true)
        
        return UserProfileResponse(
            id = user.id,
            email = user.email,
            username = user.username,
            firstName = user.firstName,
            lastName = user.lastName,
            dateOfBirth = user.dateOfBirth,
            gender = user.gender,
            profileImageUrl = user.profileImageUrl,
            currency = settings.currencyCode,
            theme = settings.theme.name.lowercase(),
            notifications = settings.notificationsEnabled,
            isEmailVerified = user.isEmailVerified,
            createdAt = user.createdAt.format(dateTimeFormatter),
            updatedAt = user.updatedAt.format(dateTimeFormatter)
        )
    }

    @Transactional
    fun updateUserProfile(userId: String, request: UpdateUserProfileRequest): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        // Check if username is being changed and is unique
        request.username?.let { newUsername ->
            if (newUsername != user.username) {
                if (userRepository.existsByUsername(newUsername)) {
                    throw BadRequestException("Username already taken")
                }
            }
        }

        // Update user fields
        user.apply {
            username = request.username ?: username
            firstName = request.firstName ?: firstName
            lastName = request.lastName ?: lastName
            dateOfBirth = request.dateOfBirth ?: dateOfBirth
            gender = request.gender ?: gender
            updatedAt = LocalDateTime.now()
        }

        userRepository.save(user)
        auditService.logUserAction(userId, "UPDATE_PROFILE", "Updated profile information")
        return getUserProfile(userId)
    }

    @Transactional
    fun updateUserSettings(userId: String, request: UpdateUserSettingsRequest): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        var settings = userSettingsRepository.findByUserId(userId).orElse(null)
            ?: UserSettings(user = user, currencyCode = "USD", theme = Theme.SYSTEM, notificationsEnabled = true)

        settings = settings.apply {
            currencyCode = request.currency ?: currencyCode
            theme = request.theme?.let { Theme.valueOf(it.uppercase()) } ?: theme
            notificationsEnabled = request.notifications ?: notificationsEnabled
            updatedAt = LocalDateTime.now()
        }

        userSettingsRepository.save(settings)
        auditService.logUserAction(userId, "UPDATE_SETTINGS", "Updated user settings")
        return getUserProfile(userId)
    }

    @Transactional
    fun changePassword(userId: String, request: ChangePasswordRequest) {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        // Verify current password
        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            throw UnauthorizedException("Current password is incorrect")
        }

        // Update password
        user.password = passwordEncoder.encode(request.newPassword)
        user.updatedAt = LocalDateTime.now()
        userRepository.save(user)
        auditService.logUserAction(userId, "CHANGE_PASSWORD", "Password changed successfully")
    }

    @Transactional
    fun uploadProfileImage(userId: String, file: MultipartFile): UploadProfileImageResponse {
        // Validate file
        if (file.isEmpty) {
            throw BadRequestException("File is empty")
        }

        if (file.size > MAX_FILE_SIZE) {
            throw BadRequestException("File size exceeds maximum allowed size of 5MB")
        }

        val contentType = file.contentType
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw BadRequestException("Invalid file type. Allowed types: JPEG, PNG, GIF, WebP")
        }

        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        // Delete old profile image if exists
        user.profileImageUrl?.let { oldUrl ->
            try {
                val oldPath = Paths.get(oldUrl.removePrefix("/"))
                Files.deleteIfExists(oldPath)
            } catch (e: Exception) {
                // Log error but continue
            }
        }

        // Save new image
        val fileExtension = file.originalFilename?.substringAfterLast('.', "jpg") ?: "jpg"
        val fileName = "${userId}_${System.currentTimeMillis()}.$fileExtension"
        val filePath = Paths.get(UPLOAD_DIR, fileName)
        
        Files.copy(file.inputStream, filePath)

        // Update user profile image URL
        val imageUrl = "/$UPLOAD_DIR/$fileName"
        user.profileImageUrl = imageUrl
        user.updatedAt = LocalDateTime.now()
        userRepository.save(user)
        auditService.logUserAction(userId, "UPLOAD_PROFILE_IMAGE", "Profile image uploaded")

        return UploadProfileImageResponse(profileImageUrl = imageUrl)
    }

    @Transactional
    fun deleteProfileImage(userId: String) {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        user.profileImageUrl?.let { imageUrl ->
            try {
                val imagePath = Paths.get(imageUrl.removePrefix("/"))
                Files.deleteIfExists(imagePath)
            } catch (e: Exception) {
                // Log error but continue
            }
        }

        user.profileImageUrl = null
        user.updatedAt = LocalDateTime.now()
        userRepository.save(user)
        auditService.logUserAction(userId, "DELETE_PROFILE_IMAGE", "Profile image deleted")
    }

    fun getCurrencies(): List<CurrencyResponse> {
        return listOf(
            CurrencyResponse("USD", "US Dollar", "$", 2),
            CurrencyResponse("EUR", "Euro", "€", 2),
            CurrencyResponse("GBP", "British Pound", "£", 2),
            CurrencyResponse("JPY", "Japanese Yen", "¥", 0),
            CurrencyResponse("CNY", "Chinese Yuan", "¥", 2),
            CurrencyResponse("INR", "Indian Rupee", "₹", 2),
            CurrencyResponse("PHP", "Philippine Peso", "₱", 2),
            CurrencyResponse("AUD", "Australian Dollar", "A$", 2),
            CurrencyResponse("CAD", "Canadian Dollar", "C$", 2),
            CurrencyResponse("CHF", "Swiss Franc", "CHF", 2),
            CurrencyResponse("HKD", "Hong Kong Dollar", "HK$", 2),
            CurrencyResponse("SGD", "Singapore Dollar", "S$", 2),
            CurrencyResponse("SEK", "Swedish Krona", "kr", 2),
            CurrencyResponse("NOK", "Norwegian Krone", "kr", 2),
            CurrencyResponse("NZD", "New Zealand Dollar", "NZ$", 2),
            CurrencyResponse("KRW", "South Korean Won", "₩", 0),
            CurrencyResponse("MXN", "Mexican Peso", "$", 2),
            CurrencyResponse("BRL", "Brazilian Real", "R$", 2),
            CurrencyResponse("RUB", "Russian Ruble", "₽", 2),
            CurrencyResponse("ZAR", "South African Rand", "R", 2)
        )
    }
}
