package com.pesowise.server.dto

import java.math.BigDecimal
import java.time.LocalDateTime

// Simple DTOs for the ReceiptController

data class ReceiptDto(
    val id: Long,
    val userId: Long,
    val filePath: String,
    val fileName: String,
    val fileType: String,
    val fileSize: Long,
    val ocrText: String?,
    val ocrConfidence: Double?,
    val merchantName: String?,
    val merchantAddress: String?,
    val merchantPhone: String?,
    val totalAmount: BigDecimal?,
    val subtotalAmount: BigDecimal?,
    val taxAmount: BigDecimal?,
    val tipAmount: BigDecimal?,
    val purchaseDate: LocalDateTime?,
    val isVerified: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val items: List<ReceiptItemDto> = emptyList(),
    val transactions: List<ReceiptTransactionDto> = emptyList()
)

data class ReceiptItemDto(
    val id: Long,
    val receiptId: Long,
    val itemName: String,
    val quantity: BigDecimal?,
    val unitPrice: BigDecimal?,
    val totalPrice: BigDecimal,
    val category: String?,
    val lineNumber: Int?
)

data class ReceiptTransactionDto(
    val id: Long,
    val receiptId: Long,
    val transactionId: Long,
    val allocatedAmount: BigDecimal,
    val notes: String?
)

data class ReceiptUploadResponse(
    val success: Boolean,
    val message: String,
    val receiptId: Long?,
    val extractedData: Map<String, Any>?
)

data class CreateReceiptRequest(
    val userId: String,
    val filePath: String,
    val fileName: String,
    val fileType: String,
    val fileSize: Long,
    val ocrText: String,
    val ocrConfidence: Double,
    val extractedData: Map<String, Any>
)

data class VerifyReceiptRequest(
    val merchantName: String?,
    val merchantAddress: String?,
    val merchantPhone: String?,
    val totalAmount: BigDecimal?,
    val subtotalAmount: BigDecimal?,
    val taxAmount: BigDecimal?,
    val tipAmount: BigDecimal?,
    val purchaseDate: LocalDateTime?,
    val items: List<VerifyReceiptItemRequest> = emptyList()
)

data class VerifyReceiptItemRequest(
    val itemName: String,
    val quantity: BigDecimal?,
    val unitPrice: BigDecimal?,
    val totalPrice: BigDecimal,
    val category: String?
)
