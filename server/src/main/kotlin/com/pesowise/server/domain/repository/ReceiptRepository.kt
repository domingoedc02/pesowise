package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.Receipt
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface ReceiptRepository : JpaRepository<Receipt, Long> {
    
    // Find receipts by user
    fun findByUserIdOrderByCreatedAtDesc(userId: String): List<Receipt>
    
    fun findByUserIdOrderByCreatedAtDesc(userId: String, pageable: Pageable): Page<Receipt>
    
    // Find by processing status
    fun findByProcessingStatus(status: Receipt.ProcessingStatus): List<Receipt>
    
    fun findByUserIdAndProcessingStatus(userId: String, status: Receipt.ProcessingStatus): List<Receipt>
    
    // Find verified/unverified receipts
    fun findByUserIdAndIsVerified(userId: String, isVerified: Boolean): List<Receipt>
    
    // Find receipts by date range
    fun findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
        userId: String, 
        startDate: LocalDateTime, 
        endDate: LocalDateTime
    ): List<Receipt>
    
    // Search receipts by merchant name or filename
    @Query("""
        SELECT r FROM Receipt r 
        WHERE r.userId = :userId 
        AND (LOWER(r.originalFilename) LIKE LOWER(CONCAT('%', :searchTerm, '%')) 
             OR LOWER(CAST(r.extractedData AS string)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
             OR LOWER(CAST(r.verifiedData AS string)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        ORDER BY r.createdAt DESC
    """)
    fun searchByUserIdAndTerm(@Param("userId") userId: String, @Param("searchTerm") searchTerm: String): List<Receipt>
    
    // Find receipts without transactions
    @Query("""
        SELECT r FROM Receipt r 
        WHERE r.userId = :userId 
        AND r.id NOT IN (SELECT rt.receiptId FROM ReceiptTransaction rt)
        ORDER BY r.createdAt DESC
    """)
    fun findUnlinkedReceiptsByUserId(@Param("userId") userId: String): List<Receipt>
    
    // Find receipts that need processing
    @Query("""
        SELECT r FROM Receipt r 
        WHERE r.processingStatus = 'PENDING' 
        AND r.createdAt < :beforeDate
        ORDER BY r.createdAt ASC
    """)
    fun findPendingProcessingBefore(@Param("beforeDate") beforeDate: LocalDateTime): List<Receipt>
    
    // Count receipts by status for user
    fun countByUserIdAndProcessingStatus(userId: String, status: Receipt.ProcessingStatus): Long
    
    fun countByUserIdAndIsVerified(userId: String, isVerified: Boolean): Long
    
    // Find receipts by month for analytics
    @Query("""
        SELECT r FROM Receipt r 
        WHERE r.userId = :userId 
        AND YEAR(r.createdAt) = :year 
        AND MONTH(r.createdAt) = :month
        ORDER BY r.createdAt DESC
    """)
    fun findByUserIdAndYearAndMonth(
        @Param("userId") userId: String, 
        @Param("year") year: Int, 
        @Param("month") month: Int
    ): List<Receipt>
    
    // Check if user has reached upload limit (for potential rate limiting)
    @Query("""
        SELECT COUNT(r) FROM Receipt r 
        WHERE r.userId = :userId 
        AND r.createdAt >= :since
    """)
    fun countUserUploadsAfter(@Param("userId") userId: String, @Param("since") since: LocalDateTime): Long
    
    // Find receipts with failed processing for retry
    @Query("""
        SELECT r FROM Receipt r 
        WHERE r.processingStatus = 'FAILED' 
        AND r.createdAt >= :retryAfter
        ORDER BY r.createdAt ASC
    """)
    fun findFailedReceiptsForRetry(@Param("retryAfter") retryAfter: LocalDateTime): List<Receipt>
}
