package com.pesowise.server.service

import com.pesowise.server.domain.entity.Receipt
import com.pesowise.server.domain.entity.ReceiptItem
import com.pesowise.server.domain.entity.ReceiptTransaction
import com.pesowise.server.domain.repository.ReceiptRepository
import com.pesowise.server.domain.repository.ReceiptItemRepository
import com.pesowise.server.domain.repository.ReceiptTransactionRepository
import com.pesowise.server.dto.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
@Transactional
class ReceiptService(
    private val receiptRepository: ReceiptRepository,
    private val receiptItemRepository: ReceiptItemRepository,
    private val receiptTransactionRepository: ReceiptTransactionRepository,
    private val fileStorageService: FileStorageService,
    private val ocrService: OCRService,
    private val receiptParsingService: ReceiptParsingService
) {

    fun uploadReceipt(userId: String, file: MultipartFile): ReceiptResponse {
        // Validate file
        validateFile(file)
        
        // Store file
        val fileInfo = fileStorageService.storeFile(file, userId)
        
        // Create receipt entity
        val receipt = Receipt(
            userId = userId,
            originalFilename = file.originalFilename ?: "receipt_${System.currentTimeMillis()}",
            originalImageUrl = fileInfo.url,
            fileSize = file.size,
            mimeType = file.contentType ?: "application/octet-stream",
            processingStatus = Receipt.ProcessingStatus.PENDING
        )
        
        val savedReceipt = receiptRepository.save(receipt)
        
        // Start async OCR processing
        processReceiptAsync(savedReceipt.id)
        
        return ReceiptResponse.fromEntity(savedReceipt)
    }

    fun processReceipt(receiptId: Long): ReceiptResponse {
        val receipt = getReceiptById(receiptId)
        
        if (receipt.processingStatus != Receipt.ProcessingStatus.PENDING) {
            throw IllegalStateException("Receipt is already processed or being processed")
        }
        
        return try {
            // Update status to processing
            val processingReceipt = receipt.copy(processingStatus = Receipt.ProcessingStatus.PROCESSING)
            receiptRepository.save(processingReceipt)
            
            // Perform OCR
            val ocrResult = ocrService.processImage(receipt.originalImageUrl)
            
            // Parse OCR results
            val extractedData = receiptParsingService.parseOCRResult(ocrResult)
            
            // Save items if extracted
            val items = extractedData["items"] as? List<Map<String, Any>> ?: emptyList()
            saveReceiptItems(receiptId, items)
            
            // Update receipt with results
            val completedReceipt = receipt.copy(
                processingStatus = Receipt.ProcessingStatus.COMPLETED,
                ocrConfidence = ocrResult.confidence,
                rawOcrText = ocrResult.text,
                extractedData = extractedData,
                processedAt = LocalDateTime.now()
            )
            
            val savedReceipt = receiptRepository.save(completedReceipt)
            ReceiptResponse.fromEntity(savedReceipt)
            
        } catch (e: Exception) {
            // Mark as failed
            val failedReceipt = receipt.copy(
                processingStatus = Receipt.ProcessingStatus.FAILED,
                processedAt = LocalDateTime.now()
            )
            receiptRepository.save(failedReceipt)
            throw e
        }
    }

    fun verifyReceipt(userId: String, request: ReceiptVerificationRequest): ReceiptResponse {
        val receipt = getReceiptByIdAndUserId(request.receiptId, userId)
        
        // Create verified data map
        val verifiedData = mutableMapOf<String, Any>().apply {
            request.merchantName?.let { this["merchantName"] = it }
            request.totalAmount?.let { this["totalAmount"] = it }
            request.date?.let { this["date"] = it.toString() }
            request.taxAmount?.let { this["taxAmount"] = it }
            request.tipAmount?.let { this["tipAmount"] = it }
            request.subtotal?.let { this["subtotal"] = it }
            request.notes?.let { this["notes"] = it }
        }
        
        // Update receipt items if provided
        if (request.items.isNotEmpty()) {
            receiptItemRepository.deleteByReceiptId(request.receiptId)
            saveReceiptItems(request.receiptId, request.items.map { item ->
                mutableMapOf<String, Any>().apply {
                    item.itemName?.let { this["itemName"] = it }
                    item.quantity?.let { this["quantity"] = it }
                    item.unitPrice?.let { this["unitPrice"] = it }
                    item.totalPrice?.let { this["totalPrice"] = it }
                    item.categorySuggestion?.let { this["categorySuggestion"] = it }
                    item.lineNumber?.let { this["lineNumber"] = it }
                }
            })
        }
        
        // Update receipt
        val verifiedReceipt = receipt.copy(
            verifiedData = verifiedData,
            isVerified = true,
            updatedAt = LocalDateTime.now()
        )
        
        val savedReceipt = receiptRepository.save(verifiedReceipt)
        return ReceiptResponse.fromEntity(savedReceipt)
    }

    fun getUserReceipts(userId: String, pageable: Pageable): Page<ReceiptResponse> {
        return receiptRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map { ReceiptResponse.fromEntity(it) }
    }

    fun getUserReceipts(userId: String): List<ReceiptResponse> {
        return receiptRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .map { ReceiptResponse.fromEntity(it) }
    }

    fun getReceiptById(userId: String, receiptId: Long): ReceiptResponse {
        val receipt = getReceiptByIdAndUserId(receiptId, userId)
        return ReceiptResponse.fromEntity(receipt)
    }

    fun searchReceipts(userId: String, searchTerm: String): ReceiptSearchResponse {
        val receipts = receiptRepository.searchByUserIdAndTerm(userId, searchTerm)
            .map { ReceiptResponse.fromEntity(it) }
        
        return ReceiptSearchResponse(
            receipts = receipts,
            totalCount = receipts.size.toLong()
        )
    }

    fun linkReceiptToTransaction(userId: String, request: ReceiptTransactionLinkRequest): Boolean {
        // Verify ownership
        getReceiptByIdAndUserId(request.receiptId, userId)
        
        // Check if link already exists
        if (receiptTransactionRepository.existsByReceiptIdAndTransactionId(
                request.receiptId, 
                request.transactionId
            )) {
            return false
        }
        
        // Create link
        val link = ReceiptTransaction.create(request.receiptId, request.transactionId)
        receiptTransactionRepository.save(link)
        
        return true
    }

    fun unlinkReceiptFromTransaction(userId: String, receiptId: Long, transactionId: Long): Boolean {
        // Verify ownership
        getReceiptByIdAndUserId(receiptId, userId)
        
        // Delete link
        receiptTransactionRepository.deleteByReceiptIdAndTransactionId(receiptId, transactionId)
        return true
    }

    fun deleteReceipt(userId: String, receiptId: Long): Boolean {
        val receipt = getReceiptByIdAndUserId(receiptId, userId)
        
        // Delete associated files
        fileStorageService.deleteFile(receipt.originalImageUrl)
        receipt.processedImageUrl?.let { fileStorageService.deleteFile(it) }
        
        // Delete receipt (cascade will handle items and transactions)
        receiptRepository.delete(receipt)
        
        return true
    }

    fun getReceiptStats(userId: String): ReceiptStatsResponse {
        val allReceipts = receiptRepository.findByUserIdOrderByCreatedAtDesc(userId)
        
        val totalReceipts = allReceipts.size.toLong()
        val processedReceipts = allReceipts.count { it.isProcessed() }.toLong()
        val verifiedReceipts = allReceipts.count { it.isVerified }.toLong()
        val unlinkedReceipts = receiptRepository.findUnlinkedReceiptsByUserId(userId).size.toLong()
        
        val totalAmount = allReceipts.mapNotNull { it.getTotalAmount() }
            .fold(BigDecimal.ZERO) { acc, amount -> acc.add(amount) }
        
        val processingTimes = allReceipts.mapNotNull { receipt ->
            if (receipt.processedAt != null) {
                java.time.Duration.between(receipt.createdAt, receipt.processedAt).toMillis()
            } else null
        }
        
        val averageProcessingTime = if (processingTimes.isNotEmpty()) {
            processingTimes.average().toLong()
        } else null
        
        val successRate = if (totalReceipts > 0) {
            BigDecimal(processedReceipts).divide(BigDecimal(totalReceipts), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal(100))
        } else BigDecimal.ZERO
        
        return ReceiptStatsResponse(
            totalReceipts = totalReceipts,
            processedReceipts = processedReceipts,
            verifiedReceipts = verifiedReceipts,
            unlinkedReceipts = unlinkedReceipts,
            totalAmount = totalAmount,
            averageProcessingTime = averageProcessingTime,
            successRate = successRate
        )
    }

    fun getUnverifiedReceipts(userId: String): List<ReceiptResponse> {
        return receiptRepository.findByUserIdAndIsVerified(userId, false)
            .map { ReceiptResponse.fromEntity(it) }
    }

    fun retryFailedProcessing(userId: String, receiptId: Long): ReceiptResponse {
        val receipt = getReceiptByIdAndUserId(receiptId, userId)
        
        if (receipt.processingStatus != Receipt.ProcessingStatus.FAILED) {
            throw IllegalStateException("Receipt is not in failed state")
        }
        
        // Reset to pending and process again
        val resetReceipt = receipt.copy(
            processingStatus = Receipt.ProcessingStatus.PENDING,
            processedAt = null,
            ocrConfidence = null,
            rawOcrText = null,
            extractedData = null
        )
        
        receiptRepository.save(resetReceipt)
        return processReceipt(receiptId)
    }

    // Private helper methods
    private fun validateFile(file: MultipartFile) {
        if (file.isEmpty) {
            throw IllegalArgumentException("File cannot be empty")
        }
        
        val allowedMimeTypes = setOf(
            "image/jpeg", "image/jpg", "image/png", "image/gif",
            "application/pdf"
        )
        
        if (file.contentType !in allowedMimeTypes) {
            throw IllegalArgumentException("Unsupported file type: ${file.contentType}")
        }
        
        // Max file size: 10MB
        if (file.size > 10 * 1024 * 1024) {
            throw IllegalArgumentException("File size too large. Maximum size is 10MB")
        }
    }

    private fun getReceiptById(receiptId: Long): Receipt {
        return receiptRepository.findById(receiptId)
            .orElseThrow { RuntimeException("Receipt not found with id: $receiptId") }
    }

    private fun getReceiptByIdAndUserId(receiptId: Long, userId: String): Receipt {
        val receipt = getReceiptById(receiptId)
        if (receipt.userId != userId) {
            throw RuntimeException("Receipt not found or access denied")
        }
        return receipt
    }

    private fun saveReceiptItems(receiptId: Long, items: List<Map<String, Any>>) {
        val receiptItems = items.mapIndexed { index, itemData ->
            ReceiptItem(
                receiptId = receiptId,
                itemName = itemData["itemName"] as? String,
                quantity = (itemData["quantity"] as? Number)?.let { BigDecimal(it.toString()) },
                unitPrice = (itemData["unitPrice"] as? Number)?.let { BigDecimal(it.toString()) },
                totalPrice = (itemData["totalPrice"] as? Number)?.let { BigDecimal(it.toString()) },
                categorySuggestion = itemData["categorySuggestion"] as? String,
                lineNumber = (itemData["lineNumber"] as? Number)?.toInt() ?: index + 1
            )
        }
        
        receiptItemRepository.saveAll(receiptItems)
    }

    private fun processReceiptAsync(receiptId: Long) {
        // This would typically be handled by a message queue or async processing
        // For now, we'll just call the sync method
        try {
            processReceipt(receiptId)
        } catch (e: Exception) {
            // Log error but don't fail the upload
            println("Failed to process receipt $receiptId: ${e.message}")
        }
    }
}
