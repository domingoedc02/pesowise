package com.pesowise.server.controller

import com.pesowise.server.domain.entity.NotificationType
import com.pesowise.server.dto.*
import com.pesowise.server.service.NotificationService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {
    
    @GetMapping
    fun getNotifications(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication
    ): ResponseEntity<PaginatedResponse<NotificationDto>> {
        val userId = authentication.name
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        val notifications = notificationService.getNotifications(userId, pageable)
        return ResponseEntity.ok(notifications)
    }
    
    @GetMapping("/unread")
    fun getUnreadNotifications(authentication: Authentication): ResponseEntity<List<NotificationDto>> {
        val userId = authentication.name
        val notifications = notificationService.getUnreadNotifications(userId)
        return ResponseEntity.ok(notifications)
    }
    
    @GetMapping("/type/{type}")
    fun getNotificationsByType(
        @PathVariable type: NotificationType,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication
    ): ResponseEntity<PaginatedResponse<NotificationDto>> {
        val userId = authentication.name
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        val notifications = notificationService.getNotificationsByType(userId, type, pageable)
        return ResponseEntity.ok(notifications)
    }
    
    @GetMapping("/unread-count")
    fun getUnreadCount(authentication: Authentication): ResponseEntity<Map<String, Long>> {
        val userId = authentication.name
        val count = notificationService.getUnreadCount(userId)
        return ResponseEntity.ok(mapOf("unreadCount" to count))
    }
    
    @PutMapping("/{id}/read")
    fun markAsRead(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.name
        notificationService.markAsRead(userId, id)
        return ResponseEntity.noContent().build()
    }
    
    @PutMapping("/read-all")
    fun markAllAsRead(authentication: Authentication): ResponseEntity<Void> {
        val userId = authentication.name
        notificationService.markAllAsRead(userId)
        return ResponseEntity.noContent().build()
    }
    
    @DeleteMapping("/{id}")
    fun deleteNotification(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.name
        notificationService.deleteNotification(userId, id)
        return ResponseEntity.noContent().build()
    }
    
    @DeleteMapping("/cleanup")
    fun cleanupOldNotifications(authentication: Authentication): ResponseEntity<Void> {
        val userId = authentication.name
        notificationService.cleanupOldNotifications(userId)
        return ResponseEntity.noContent().build()
    }
}
