package com.pesowise.server.service

import com.pesowise.server.domain.entity.*
import com.pesowise.server.domain.repository.*
import com.pesowise.server.dto.*
import com.pesowise.server.security.CustomUserDetails
import com.pesowise.server.security.JwtService
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val userSettingsRepository: UserSettingsRepository,
    private val emailVerificationRepository: EmailVerificationRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val authenticationManager: AuthenticationManager,
    private val emailService: EmailService,
    private val auditService: AuditService
) {
    
    companion object {
        private const val OTP_EXPIRY_MINUTES = 10L
        private const val PASSWORD_RESET_EXPIRY_HOURS = 1L
    }
    
    @Transactional
    fun register(request: RegisterRequest): MessageResponse {
        // Check if user already exists
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("User with email ${request.email} already exists")
        }
        
        // Create new user with just email
        val user = User(
            email = request.email,
            isEmailVerified = false,
            isProfileComplete = false
        )
        userRepository.save(user)
        
        // Generate and send OTP
        val otp = generateOtp()
        val emailVerification = EmailVerification(
            email = request.email,
            otpCode = otp,
            expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)
        )
        emailVerificationRepository.save(emailVerification)
        
        // Send OTP email
        emailService.sendOtpEmail(request.email, otp)
        
        auditService.logAuthenticationEvent(request.email, "REGISTRATION_STARTED", true)
        
        return MessageResponse("Verification code sent to ${request.email}")
    }
    
    @Transactional
    fun verifyOtp(request: VerifyOtpRequest): MessageResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        val verification = emailVerificationRepository
            .findLatestActiveByEmail(request.email)
            .orElseThrow { IllegalArgumentException("No active verification found") }
        
        if (!verification.isValid(request.otpCode)) {
            throw IllegalArgumentException("Invalid or expired OTP code")
        }
        
        // Mark email as verified
        verification.isVerified = true
        emailVerificationRepository.save(verification)
        
        user.isEmailVerified = true
        userRepository.save(user)
        
        auditService.logAuthenticationEvent(request.email, "EMAIL_VERIFIED", true)
        
        return MessageResponse("Email verified successfully. Please complete your profile.")
    }
    
    @Transactional
    fun completeProfile(request: CompleteProfileRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        if (!user.isEmailVerified) {
            throw IllegalArgumentException("Email not verified")
        }
        
        if (user.isProfileComplete) {
            throw IllegalArgumentException("Profile already completed")
        }
        
        // Check if username is already taken
        if (userRepository.existsByUsername(request.username)) {
            throw IllegalArgumentException("Username already taken")
        }
        
        // Update user profile
        user.apply {
            username = request.username
            password = passwordEncoder.encode(request.password)
            firstName = request.firstName
            lastName = request.lastName
            dateOfBirth = request.dateOfBirth
            gender = request.gender
            isProfileComplete = true
        }
        val savedUser = userRepository.save(user)
        
        // Create default user settings
        val settings = UserSettings(
            user = savedUser,
            currencyCode = "USD",
            theme = Theme.SYSTEM,
            language = "en",
            notificationsEnabled = true
        )
        userSettingsRepository.save(settings)
        
        // Send welcome email
        emailService.sendWelcomeEmail(user.email, user.firstName)
        
        auditService.logAuthenticationEvent(user.email, "PROFILE_COMPLETED", true)
        auditService.logUserAction(savedUser.id, "REGISTRATION_COMPLETED", "User completed registration")
        
        // Generate tokens and return auth response
        val userDetails = CustomUserDetails(savedUser)
        val accessToken = jwtService.generateToken(userDetails)
        val refreshToken = jwtService.generateRefreshToken(userDetails)
        
        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = 86400000, // 24 hours
            user = toUserDto(savedUser)
        )
    }
    
    @Transactional
    fun login(request: LoginRequest): AuthResponse {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.usernameOrEmail, request.password)
        )
        
        val userDetails = authentication.principal as CustomUserDetails
        val user = userDetails.getUser()
        
        // Update last login
        user.lastLoginAt = LocalDateTime.now()
        userRepository.save(user)
        
        auditService.logAuthenticationEvent(user.email, "LOGIN", true)
        
        val accessToken = jwtService.generateToken(userDetails)
        val refreshToken = jwtService.generateRefreshToken(userDetails)
        
        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = 86400000, // 24 hours
            user = toUserDto(user)
        )
    }
    
    @Transactional
    fun refreshToken(request: RefreshTokenRequest): AuthResponse {
        val username = jwtService.extractUsername(request.refreshToken)
        val user = userRepository.findActiveUserByEmailOrUsername(username)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        val userDetails = CustomUserDetails(user)
        
        if (!jwtService.isTokenValid(request.refreshToken, userDetails)) {
            throw IllegalArgumentException("Invalid refresh token")
        }
        
        val accessToken = jwtService.generateToken(userDetails)
        val newRefreshToken = jwtService.generateRefreshToken(userDetails)
        
        return AuthResponse(
            accessToken = accessToken,
            refreshToken = newRefreshToken,
            expiresIn = 86400000, // 24 hours
            user = toUserDto(user)
        )
    }
    
    @Transactional
    fun forgotPassword(request: ForgotPasswordRequest): MessageResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        // Invalidate any existing tokens
        passwordResetTokenRepository.invalidateAllUserTokens(user.id)
        
        // Generate new token
        val token = UUID.randomUUID().toString()
        val resetToken = PasswordResetToken(
            user = user,
            token = token,
            expiresAt = LocalDateTime.now().plusHours(PASSWORD_RESET_EXPIRY_HOURS)
        )
        passwordResetTokenRepository.save(resetToken)
        
        // Send reset email
        val resetLink = "http://localhost:3000/reset-password?token=$token"
        emailService.sendPasswordResetEmail(user.email, resetLink)
        
        auditService.logAuthenticationEvent(user.email, "PASSWORD_RESET_REQUESTED", true)
        
        return MessageResponse("Password reset link sent to ${request.email}")
    }
    
    @Transactional
    fun resetPassword(request: ResetPasswordRequest): MessageResponse {
        val resetToken = passwordResetTokenRepository.findByToken(request.token)
            .orElseThrow { IllegalArgumentException("Invalid token") }
        
        if (!resetToken.isValid()) {
            throw IllegalArgumentException("Token expired or already used")
        }
        
        val user = resetToken.user
        user.password = passwordEncoder.encode(request.newPassword)
        userRepository.save(user)
        
        resetToken.isUsed = true
        passwordResetTokenRepository.save(resetToken)
        
        auditService.logAuthenticationEvent(user.email, "PASSWORD_RESET_COMPLETED", true)
        
        return MessageResponse("Password reset successfully")
    }
    
    fun checkEmailExists(email: String): Boolean {
        return userRepository.existsByEmail(email)
    }
    
    fun checkUsernameExists(username: String): Boolean {
        return userRepository.existsByUsername(username)
    }
    
    private fun generateOtp(): String {
        return (100000..999999).random().toString()
    }
    
    private fun toUserDto(user: User): UserDto {
        val settings = user.settings?.let {
            UserSettingsDto(
                currencyCode = it.currencyCode,
                theme = it.theme.name,
                language = it.language,
                notificationsEnabled = it.notificationsEnabled
            )
        }
        
        return UserDto(
            id = user.id,
            email = user.email,
            username = user.username,
            firstName = user.firstName,
            lastName = user.lastName,
            profileImageUrl = user.profileImageUrl,
            isEmailVerified = user.isEmailVerified,
            isProfileComplete = user.isProfileComplete,
            settings = settings
        )
    }
}
