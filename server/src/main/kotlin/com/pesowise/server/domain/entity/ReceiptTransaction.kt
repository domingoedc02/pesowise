package com.pesowise.server.domain.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "receipt_transactions",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_receipt_transaction",
            columnNames = ["receipt_id", "transaction_id"]
        )
    ]
)
data class ReceiptTransaction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "receipt_id", nullable = false)
    val receiptId: Long,

    @Column(name = "transaction_id", nullable = false)
    val transactionId: Long,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", insertable = false, updatable = false)
    @JsonIgnore
    val receipt: Receipt? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", insertable = false, updatable = false)
    @JsonIgnore
    val transaction: Transaction? = null

    // Helper methods
    fun isValidLink(): Boolean {
        return receiptId > 0 && transactionId > 0
    }

    companion object {
        fun create(receiptId: Long, transactionId: Long): ReceiptTransaction {
            return ReceiptTransaction(
                receiptId = receiptId,
                transactionId = transactionId
            )
        }
    }
}
