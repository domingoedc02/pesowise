package com.pesowise.server.domain.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "receipt_items")
data class ReceiptItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "receipt_id", nullable = false)
    val receiptId: Long,

    @Column(name = "item_name", length = 255)
    val itemName: String? = null,

    @Column(name = "quantity", precision = 10, scale = 2)
    val quantity: BigDecimal? = null,

    @Column(name = "unit_price", precision = 15, scale = 2)
    val unitPrice: BigDecimal? = null,

    @Column(name = "total_price", precision = 15, scale = 2)
    val totalPrice: BigDecimal? = null,

    @Column(name = "category_suggestion", length = 100)
    val categorySuggestion: String? = null,

    @Column(name = "line_number")
    val lineNumber: Int? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", insertable = false, updatable = false)
    @JsonIgnore
    val receipt: Receipt? = null

    // Helper methods
    fun getCalculatedTotal(): BigDecimal? {
        return if (quantity != null && unitPrice != null) {
            quantity!!.multiply(unitPrice)
        } else {
            totalPrice
        }
    }

    fun isValidItem(): Boolean {
        return !itemName.isNullOrBlank() && (totalPrice != null || (quantity != null && unitPrice != null))
    }

    fun getDisplayName(): String {
        return itemName ?: "Unknown Item"
    }

    fun getFormattedPrice(): String {
        val price = getCalculatedTotal()
        return if (price != null) {
            String.format("%.2f", price)
        } else {
            "0.00"
        }
    }
}
