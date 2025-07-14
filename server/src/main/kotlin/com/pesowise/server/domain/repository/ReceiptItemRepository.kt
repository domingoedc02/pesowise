package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.ReceiptItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface ReceiptItemRepository : JpaRepository<ReceiptItem, Long> {
    
    // Find items by receipt
    fun findByReceiptIdOrderByLineNumberAsc(receiptId: Long): List<ReceiptItem>
    
    // Find items by receipt with valid data
    @Query("""
        SELECT ri FROM ReceiptItem ri 
        WHERE ri.receiptId = :receiptId 
        AND ri.itemName IS NOT NULL 
        AND (ri.totalPrice IS NOT NULL OR (ri.quantity IS NOT NULL AND ri.unitPrice IS NOT NULL))
        ORDER BY ri.lineNumber ASC
    """)
    fun findValidItemsByReceiptId(@Param("receiptId") receiptId: Long): List<ReceiptItem>
    
    // Calculate total for receipt from items
    @Query("""
        SELECT COALESCE(SUM(
            CASE 
                WHEN ri.totalPrice IS NOT NULL THEN ri.totalPrice
                WHEN ri.quantity IS NOT NULL AND ri.unitPrice IS NOT NULL THEN ri.quantity * ri.unitPrice
                ELSE 0
            END
        ), 0) 
        FROM ReceiptItem ri 
        WHERE ri.receiptId = :receiptId
    """)
    fun calculateTotalByReceiptId(@Param("receiptId") receiptId: Long): BigDecimal
    
    // Count items by receipt
    fun countByReceiptId(receiptId: Long): Long
    
    // Find items by category suggestion
    fun findByCategorySuggestion(categorySuggestion: String): List<ReceiptItem>
    
    // Find items with price range
    @Query("""
        SELECT ri FROM ReceiptItem ri 
        WHERE ri.receiptId = :receiptId 
        AND (
            (ri.totalPrice BETWEEN :minPrice AND :maxPrice) 
            OR (ri.quantity IS NOT NULL AND ri.unitPrice IS NOT NULL 
                AND ri.quantity * ri.unitPrice BETWEEN :minPrice AND :maxPrice)
        )
        ORDER BY ri.lineNumber ASC
    """)
    fun findItemsByReceiptIdAndPriceRange(
        @Param("receiptId") receiptId: Long,
        @Param("minPrice") minPrice: BigDecimal,
        @Param("maxPrice") maxPrice: BigDecimal
    ): List<ReceiptItem>
    
    // Search items by name
    @Query("""
        SELECT ri FROM ReceiptItem ri 
        WHERE ri.receiptId = :receiptId 
        AND LOWER(ri.itemName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        ORDER BY ri.lineNumber ASC
    """)
    fun searchItemsByReceiptIdAndName(
        @Param("receiptId") receiptId: Long,
        @Param("searchTerm") searchTerm: String
    ): List<ReceiptItem>
    
    // Delete items by receipt (for cleanup)
    fun deleteByReceiptId(receiptId: Long)
    
    // Find expensive items across all receipts for user (for analytics)
    @Query("""
        SELECT ri FROM ReceiptItem ri 
        JOIN Receipt r ON ri.receiptId = r.id 
        WHERE r.userId = :userId 
        AND (
            ri.totalPrice >= :minAmount 
            OR (ri.quantity IS NOT NULL AND ri.unitPrice IS NOT NULL 
                AND ri.quantity * ri.unitPrice >= :minAmount)
        )
        ORDER BY 
            CASE 
                WHEN ri.totalPrice IS NOT NULL THEN ri.totalPrice
                ELSE ri.quantity * ri.unitPrice
            END DESC
    """)
    fun findExpensiveItemsByUserId(
        @Param("userId") userId: Long,
        @Param("minAmount") minAmount: BigDecimal
    ): List<ReceiptItem>
}
