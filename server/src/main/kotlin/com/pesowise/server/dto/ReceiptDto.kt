package com.pesowise.server.dto

import com.pesowise.server.domain.entity.Receipt
import jakarta.validation.constraints.*
import org.springframework.web.multipart.MultipartFile
import java.math.BigDecimal
import java.time.LocalDateTime

// Request DTOs
data class ReceiptUploadRequest(
    @field:NotNull(message = "File is required")
    val file: MultipartFile
)

data class ReceiptProcessRequest(
    @field:NotNull(message = "Receipt ID is required")
    val receiptId: Long
)

data class ReceiptVerificationRequest(
    @field:NotNull(message = "Receipt ID is required")
    val receiptId: Long,
    
    @field:NotBlank(message = "Merchant name is required")
    val merchantName: String,
    
    @field:NotNull(message = "Total amount is required")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Amount must be positive")
    val totalAmount: BigDecimal,
    
    val date: LocalDateTime?,
    val taxAmount: BigDecimal?,
    val tipAmount: BigDecimal?,
    val subtotal: BigDecimal?,
    val items: List<ReceiptItemRequest> = emptyList(),
    val notes: String?
)

data class ReceiptItemRequest(
    @field:NotBlank(message = "Item name is required")
    val itemName: String,
    
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    val quantity: BigDecimal?,
    
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be positive")
    val unitPrice: BigDecimal?,
    
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Total price must be positive")
    val totalPrice: BigDecimal?,
    
    val categorySuggestion: String?,
    val lineNumber: Int?
)

data class ReceiptTransactionLinkRequest(
    @field:NotNull(message = "Receipt ID is required")
    val receiptId: Long,
    
    @field:NotNull(message = "Transaction ID is required")
    val transactionId: Long
)

data class CreateTransactionFromReceiptRequest(
    @field:NotNull(message = "Receipt ID is required")
    val receiptId: Long,
    
    @field:NotNull(message = "Account ID is required")
    val accountId: Long,
    
    @field:NotNull(message = "Category ID is required")
    val categoryId: Long,
    
    val description: String?,
    val tags: List<String> = emptyList()
)

// Response DTOs
data class ReceiptResponse(
    val id: Long,
    val originalFilename: String,
    val originalImageUrl: String,
    val processedImageUrl: String?,
    val fileSize: Long,
    val mimeType: String,
    val processingStatus: Receipt.ProcessingStatus,
    val ocrConfidence: BigDecimal?,
    val extractedData: ExtractedReceiptData?,
    val verifiedData: VerifiedReceiptData?,
    val isVerified: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val processedAt: LocalDateTime?,
    val items: List<ReceiptItemResponse> = emptyList(),
    val linkedTransactionIds: List<Long> = emptyList()
) {
    companion object {
        fun fromEntity(receipt: Receipt): ReceiptResponse {
            return ReceiptResponse(
                id = receipt.id,
                originalFilename = receipt.originalFilename,
                originalImageUrl = receipt.originalImageUrl,
                processedImageUrl = receipt.processedImageUrl,
                fileSize = receipt.fileSize,
                mimeType = receipt.mimeType,
                processingStatus = receipt.processingStatus,
                ocrConfidence = receipt.ocrConfidence,
                extractedData = receipt.extractedData?.let { ExtractedReceiptData.fromMap(it) },
                verifiedData = receipt.verifiedData?.let { VerifiedReceiptData.fromMap(it) },
                isVerified = receipt.isVerified,
                createdAt = receipt.createdAt,
                updatedAt = receipt.updatedAt,
                processedAt = receipt.processedAt,
                items = receipt.receiptItems.map { ReceiptItemResponse.fromEntity(it) },
                linkedTransactionIds = receipt.receiptTransactions.map { it.transactionId }
            )
        }
    }
}

data class ReceiptItemResponse(
    val id: Long,
    val itemName: String?,
    val quantity: BigDecimal?,
    val unitPrice: BigDecimal?,
    val totalPrice: BigDecimal?,
    val categorySuggestion: String?,
    val lineNumber: Int?,
    val createdAt: LocalDateTime
) {
    companion object {
        fun fromEntity(item: com.pesowise.server.domain.entity.ReceiptItem): ReceiptItemResponse {
            return ReceiptItemResponse(
                id = item.id,
                itemName = item.itemName,
                quantity = item.quantity,
                unitPrice = item.unitPrice,
                totalPrice = item.totalPrice,
                categorySuggestion = item.categorySuggestion,
                lineNumber = item.lineNumber,
                createdAt = item.createdAt
            )
        }
    }
}

data class ExtractedReceiptData(
    val merchantName: String?,
    val totalAmount: BigDecimal?,
    val subtotal: BigDecimal?,
    val taxAmount: BigDecimal?,
    val tipAmount: BigDecimal?,
    val date: String?,
    val time: String?,
    val address: String?,
    val phoneNumber: String?,
    val items: List<Map<String, Any>> = emptyList(),
    val confidence: BigDecimal?
) {
    companion object {
        fun fromMap(data: Map<String, Any>): ExtractedReceiptData {
            return ExtractedReceiptData(
                merchantName = data["merchantName"] as? String,
                totalAmount = (data["totalAmount"] as? Number)?.let { BigDecimal(it.toString()) },
                subtotal = (data["subtotal"] as? Number)?.let { BigDecimal(it.toString()) },
                taxAmount = (data["taxAmount"] as? Number)?.let { BigDecimal(it.toString()) },
                tipAmount = (data["tipAmount"] as? Number)?.let { BigDecimal(it.toString()) },
                date = data["date"] as? String,
                time = data["time"] as? String,
                address = data["address"] as? String,
                phoneNumber = data["phoneNumber"] as? String,
                items = (data["items"] as? List<Map<String, Any>>) ?: emptyList(),
                confidence = (data["confidence"] as? Number)?.let { BigDecimal(it.toString()) }
            )
        }
    }
}

data class VerifiedReceiptData(
    val merchantName: String,
    val totalAmount: BigDecimal,
    val subtotal: BigDecimal?,
    val taxAmount: BigDecimal?,
    val tipAmount: BigDecimal?,
    val date: String?,
    val notes: String?
) {
    companion object {
        fun fromMap(data: Map<String, Any>): VerifiedReceiptData {
            return VerifiedReceiptData(
                merchantName = data["merchantName"] as? String ?: "",
                totalAmount = (data["totalAmount"] as? Number)?.let { BigDecimal(it.toString()) } ?: BigDecimal.ZERO,
                subtotal = (data["subtotal"] as? Number)?.let { BigDecimal(it.toString()) },
                taxAmount = (data["taxAmount"] as? Number)?.let { BigDecimal(it.toString()) },
                tipAmount = (data["tipAmount"] as? Number)?.let { BigDecimal(it.toString()) },
                date = data["date"] as? String,
                notes = data["notes"] as? String
            )
        }
    }
}

data class ReceiptListResponse(
    val receipts: List<ReceiptResponse>,
    val totalCount: Long,
    val unverifiedCount: Long,
    val processingCount: Long,
    val failedCount: Long
)

data class ReceiptStatsResponse(
    val totalReceipts: Long,
    val processedReceipts: Long,
    val verifiedReceipts: Long,
    val unlinkedReceipts: Long,
    val totalAmount: BigDecimal,
    val averageProcessingTime: Long?, // in milliseconds
    val successRate: BigDecimal // percentage
)

data class ReceiptSearchResponse(
    val receipts: List<ReceiptResponse>,
    val totalCount: Long
)

// Error DTOs
data class ReceiptErrorResponse(
    val message: String,
    val code: String,
    val details: Map<String, Any>? = null
)
