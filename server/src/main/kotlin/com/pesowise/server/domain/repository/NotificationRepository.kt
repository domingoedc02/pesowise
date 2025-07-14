package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.Notification
import com.pesowise.server.domain.entity.NotificationType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface NotificationRepository : JpaRepository<Notification, String> {
    fun findByUserIdOrderByCreatedAtDesc(userId: String, pageable: Pageable): Page<Notification>
    
    fun findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId: String): List<Notification>
    
    fun findByUserIdAndId(userId: String, id: Long): Notification?
    
    fun findByUserIdAndTypeOrderByCreatedAtDesc(userId: String, type: NotificationType, pageable: Pageable): Page<Notification>
    
    fun countByUserIdAndIsReadFalse(userId: String): Long
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.isRead = false")
    fun markAllAsRead(userId: String)
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId AND n.isRead = true AND n.createdAt < :cutoffDate")
    fun deleteOldReadNotifications(userId: String, cutoffDate: java.time.LocalDateTime)
}
