package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.ReceiptTransaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ReceiptTransactionRepository : JpaRepository<ReceiptTransaction, Long> {
    
    // Find by receipt
    fun findByReceiptId(receiptId: Long): List<ReceiptTransaction>
    
    // Find by transaction
    fun findByTransactionId(transactionId: Long): List<ReceiptTransaction>
    
    // Check if link exists
    fun existsByReceiptIdAndTransactionId(receiptId: Long, transactionId: Long): Boolean
    
    // Find specific link
    fun findByReceiptIdAndTransactionId(receiptId: Long, transactionId: Long): ReceiptTransaction?
    
    // Delete specific link
    fun deleteByReceiptIdAndTransactionId(receiptId: Long, transactionId: Long)
    
    // Delete all links for receipt
    fun deleteByReceiptId(receiptId: Long)
    
    // Delete all links for transaction
    fun deleteByTransactionId(transactionId: Long)
    
    // Count links by receipt
    fun countByReceiptId(receiptId: Long): Long
    
    // Count links by transaction
    fun countByTransactionId(transactionId: Long): Long
    
    // Find transactions by receipt
    @Query("""
        SELECT rt.transactionId FROM ReceiptTransaction rt 
        WHERE rt.receiptId = :receiptId
    """)
    fun findTransactionIdsByReceiptId(@Param("receiptId") receiptId: Long): List<Long>
    
    // Find receipts by transaction
    @Query("""
        SELECT rt.receiptId FROM ReceiptTransaction rt 
        WHERE rt.transactionId = :transactionId
    """)
    fun findReceiptIdsByTransactionId(@Param("transactionId") transactionId: Long): List<Long>
    
    // Find all transactions for user's receipts
    @Query("""
        SELECT DISTINCT rt.transactionId FROM ReceiptTransaction rt 
        JOIN Receipt r ON rt.receiptId = r.id 
        WHERE r.userId = :userId
    """)
    fun findTransactionIdsByUserId(@Param("userId") userId: String): List<Long>
    
    // Find orphaned receipts (receipts without transactions)
    @Query("""
        SELECT r.id FROM Receipt r 
        WHERE r.userId = :userId 
        AND r.id NOT IN (SELECT rt.receiptId FROM ReceiptTransaction rt)
    """)
    fun findOrphanedReceiptIds(@Param("userId") userId: String): List<Long>
    
    // Find orphaned transactions (transactions without receipts)
    @Query("""
        SELECT t.id FROM Transaction t 
        WHERE t.user.id = :userId 
        AND t.id NOT IN (SELECT rt.transactionId FROM ReceiptTransaction rt)
    """)
    fun findOrphanedTransactionIds(@Param("userId") userId: String): List<Long>
}
