package com.pesowise.server.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.pesowise.server.domain.entity.Notification
import com.pesowise.server.domain.entity.NotificationType
import com.pesowise.server.domain.repository.NotificationRepository
import com.pesowise.server.domain.repository.UserRepository
import com.pesowise.server.dto.*
import com.pesowise.server.exception.ResourceNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper
) {
    
    fun getNotifications(userId: String, pageable: Pageable): PaginatedResponse<NotificationDto> {
        val page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
        return page.toPaginatedResponse()
    }
    
    fun getUnreadNotifications(userId: String): List<NotificationDto> {
        val notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
        return notifications.map { it.toDto() }
    }
    
    fun getNotificationsByType(userId: String, type: NotificationType, pageable: Pageable): PaginatedResponse<NotificationDto> {
        val page = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable)
        return page.toPaginatedResponse()
    }
    
    fun getUnreadCount(userId: String): Long {
        return notificationRepository.countByUserIdAndIsReadFalse(userId)
    }
    
    fun markAsRead(userId: String, notificationId: Long) {
        val notification = notificationRepository.findByUserIdAndId(userId, notificationId)
            ?: throw ResourceNotFoundException("Notification not found")
        
        if (!notification.isRead) {
            notification.isRead = true
            notification.readAt = LocalDateTime.now()
            notificationRepository.save(notification)
        }
    }
    
    fun markAllAsRead(userId: String) {
        notificationRepository.markAllAsRead(userId)
    }
    
    fun createNotification(
        userId: String,
        type: NotificationType,
        title: String,
        message: String,
        data: Map<String, Any>? = null
    ): NotificationDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        val notification = Notification(
            user = user,
            type = type,
            title = title,
            message = message,
            data = data?.let { objectMapper.writeValueAsString(it) }
        )
        
        val savedNotification = notificationRepository.save(notification)
        
        // TODO: Send real-time notification via WebSocket or push notification
        
        return savedNotification.toDto()
    }
    
    fun deleteNotification(userId: String, notificationId: Long) {
        val notification = notificationRepository.findByUserIdAndId(userId, notificationId)
            ?: throw ResourceNotFoundException("Notification not found")
        
        notificationRepository.delete(notification)
    }
    
    fun cleanupOldNotifications(userId: String) {
        val cutoffDate = LocalDateTime.now().minusDays(30)
        notificationRepository.deleteOldReadNotifications(userId, cutoffDate)
    }
    
    private fun Notification.toDto(): NotificationDto {
        val dataMap = data?.let {
            try {
                objectMapper.readValue(it, Map::class.java) as Map<String, Any>
            } catch (e: Exception) {
                null
            }
        }
        
        return NotificationDto(
            id = id,
            type = type,
            title = title,
            message = message,
            data = dataMap,
            isRead = isRead,
            readAt = readAt,
            createdAt = createdAt
        )
    }
    
    private fun Page<Notification>.toPaginatedResponse(): PaginatedResponse<NotificationDto> {
        return PaginatedResponse(
            content = content.map { it.toDto() },
            totalElements = totalElements,
            totalPages = totalPages,
            currentPage = number,
            pageSize = size,
            isFirst = isFirst,
            isLast = isLast
        )
    }
}
