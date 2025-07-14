package com.pesowise.server.domain.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "receipts")
data class Receipt(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: String,

    @Column(name = "original_filename", nullable = false, length = 255)
    val originalFilename: String,

    @Column(name = "original_image_url", nullable = false, length = 500)
    val originalImageUrl: String,

    @Column(name = "processed_image_url", length = 500)
    val processedImageUrl: String? = null,

    @Column(name = "file_size", nullable = false)
    val fileSize: Long,

    @Column(name = "mime_type", nullable = false, length = 100)
    val mimeType: String,

    @Column(name = "processing_status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    val processingStatus: ProcessingStatus = ProcessingStatus.PENDING,

    @Column(name = "ocr_confidence", precision = 5, scale = 2)
    val ocrConfidence: BigDecimal? = null,

    @Column(name = "raw_ocr_text")
    val rawOcrText: String? = null,

    @Column(name = "extracted_data")
    @JdbcTypeCode(SqlTypes.JSON)
    val extractedData: Map<String, Any>? = null,

    @Column(name = "verified_data")
    @JdbcTypeCode(SqlTypes.JSON)
    val verifiedData: Map<String, Any>? = null,

    @Column(name = "is_verified", nullable = false)
    val isVerified: Boolean = false,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "processed_at")
    val processedAt: LocalDateTime? = null
) {
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    val user: User? = null

    @OneToMany(mappedBy = "receipt", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val receiptItems: List<ReceiptItem> = emptyList()

    @OneToMany(mappedBy = "receipt", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val receiptTransactions: List<ReceiptTransaction> = emptyList()

    enum class ProcessingStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }

    // Helper methods
    fun getTransactions(): List<Transaction> {
        return receiptTransactions.mapNotNull { it.transaction }
    }

    fun isProcessed(): Boolean {
        return processingStatus == ProcessingStatus.COMPLETED
    }

    fun isFailed(): Boolean {
        return processingStatus == ProcessingStatus.FAILED
    }

    fun getTotalAmount(): BigDecimal? {
        return extractedData?.get("totalAmount") as? BigDecimal
            ?: verifiedData?.get("totalAmount") as? BigDecimal
    }

    fun getMerchantName(): String? {
        return extractedData?.get("merchantName") as? String
            ?: verifiedData?.get("merchantName") as? String
    }

    fun getReceiptDate(): LocalDateTime? {
        val dateString = extractedData?.get("date") as? String
            ?: verifiedData?.get("date") as? String
        return dateString?.let { LocalDateTime.parse(it) }
    }
}
