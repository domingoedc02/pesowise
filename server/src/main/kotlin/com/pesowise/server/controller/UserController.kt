package com.pesowise.server.controller

import com.pesowise.server.dto.*
import com.pesowise.server.security.CustomUserDetails
import com.pesowise.server.service.UserService
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService
) {

    @GetMapping("/profile")
    fun getUserProfile(@AuthenticationPrincipal userDetails: CustomUserDetails): ResponseEntity<UserProfileResponse> {
        val profile = userService.getUserProfile(userDetails.getId())
        return ResponseEntity.ok(profile)
    }

    @PutMapping("/profile")
    fun updateUserProfile(
        @AuthenticationPrincipal userDetails: CustomUserDetails,
        @Valid @RequestBody request: UpdateUserProfileRequest
    ): ResponseEntity<UserProfileResponse> {
        val profile = userService.updateUserProfile(userDetails.getId(), request)
        return ResponseEntity.ok(profile)
    }

    @PutMapping("/settings")
    fun updateUserSettings(
        @AuthenticationPrincipal userDetails: CustomUserDetails,
        @Valid @RequestBody request: UpdateUserSettingsRequest
    ): ResponseEntity<UserProfileResponse> {
        val profile = userService.updateUserSettings(userDetails.getId(), request)
        return ResponseEntity.ok(profile)
    }

    @PostMapping("/change-password")
    fun changePassword(
        @AuthenticationPrincipal userDetails: CustomUserDetails,
        @Valid @RequestBody request: ChangePasswordRequest
    ): ResponseEntity<Map<String, String>> {
        userService.changePassword(userDetails.getId(), request)
        return ResponseEntity.ok(mapOf("message" to "Password changed successfully"))
    }

    @PostMapping("/profile-image", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadProfileImage(
        @AuthenticationPrincipal userDetails: CustomUserDetails,
        @RequestParam("image") file: MultipartFile
    ): ResponseEntity<UploadProfileImageResponse> {
        val response = userService.uploadProfileImage(userDetails.getId(), file)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/profile-image")
    fun deleteProfileImage(@AuthenticationPrincipal userDetails: CustomUserDetails): ResponseEntity<Map<String, String>> {
        userService.deleteProfileImage(userDetails.getId())
        return ResponseEntity.ok(mapOf("message" to "Profile image deleted successfully"))
    }

    @GetMapping("/currencies")
    fun getCurrencies(): ResponseEntity<List<CurrencyResponse>> {
        val currencies = userService.getCurrencies()
        return ResponseEntity.ok(currencies)
    }
}
