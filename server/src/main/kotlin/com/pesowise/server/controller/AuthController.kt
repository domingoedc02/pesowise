package com.pesowise.server.controller

import com.pesowise.server.dto.*
import com.pesowise.server.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
class AuthController(
    private val authService: AuthService
) {
    
    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<MessageResponse> {
        return ResponseEntity.ok(authService.register(request))
    }
    
    @PostMapping("/verify-otp")
    fun verifyOtp(@Valid @RequestBody request: VerifyOtpRequest): ResponseEntity<MessageResponse> {
        return ResponseEntity.ok(authService.verifyOtp(request))
    }
    
    @PostMapping("/complete-profile")
    fun completeProfile(@Valid @RequestBody request: CompleteProfileRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.completeProfile(request))
    }
    
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.login(request))
    }
    
    @PostMapping("/refresh-token")
    fun refreshToken(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.refreshToken(request))
    }
    
    @PostMapping("/forgot-password")
    fun forgotPassword(@Valid @RequestBody request: ForgotPasswordRequest): ResponseEntity<MessageResponse> {
        return ResponseEntity.ok(authService.forgotPassword(request))
    }
    
    @PostMapping("/reset-password")
    fun resetPassword(@Valid @RequestBody request: ResetPasswordRequest): ResponseEntity<MessageResponse> {
        return ResponseEntity.ok(authService.resetPassword(request))
    }
    
    @PostMapping("/logout")
    fun logout(): ResponseEntity<MessageResponse> {
        // Since we're using JWT, logout is handled on the client side
        // by removing the token from storage
        return ResponseEntity.ok(MessageResponse("Logged out successfully"))
    }
    
    @GetMapping("/check-email/{email}")
    fun checkEmail(@PathVariable email: String): ResponseEntity<Map<String, Boolean>> {
        val exists = authService.checkEmailExists(email)
        return ResponseEntity.ok(mapOf("exists" to exists))
    }
    
    @GetMapping("/check-username/{username}")
    fun checkUsername(@PathVariable username: String): ResponseEntity<Map<String, Boolean>> {
        val exists = authService.checkUsernameExists(username)
        return ResponseEntity.ok(mapOf("exists" to exists))
    }
}
