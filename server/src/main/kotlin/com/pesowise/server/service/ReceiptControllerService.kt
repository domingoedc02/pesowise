//package com.pesowise.server.service
//
//import com.pesowise.server.dto.*
//import com.pesowise.server.domain.entity.*
//import com.pesowise.server.domain.repository.*
//import org.springframework.data.domain.PageRequest
//import org.springframework.stereotype.Service
//import org.springframework.transaction.annotation.Transactional
//import java.math.BigDecimal
//import java.time.LocalDateTime
//
//@Service
//@Transactional
//class ReceiptControllerService(
//    private val receiptRepository: ReceiptRepository,
//    private val receiptItemRepository: ReceiptItemRepository,
//    private val receiptTransactionRepository: ReceiptTransactionRepository,
//    private val transactionRepository: TransactionRepository,
//    private val accountRepository: AccountRepository
//) {
//
//    fun createReceipt(request: CreateReceiptRequest): ReceiptDto {
//        val receipt = Receipt(
//            userId = request.userId,
//            originalFilename = request.fileName,
//            originalImageUrl = request.filePath,
//            fileSize = request.fileSize,
//            mimeType = request.fileType,
//            processingStatus = Receipt.ProcessingStatus.COMPLETED,
//            ocrConfidence = BigDecimal(request.ocrConfidence),
//            rawOcrText = request.ocrText,
//            extractedData = request.extractedData,
//            processedAt = LocalDateTime.now()
//        )
//
//        val savedReceipt = receiptRepository.save(receipt)
//
//        // Save extracted items
//        val items = request.extractedData["items"] as? List<Map<String, Any>> ?: emptyList()
//        val savedItems = items.mapIndexed { index, itemData ->
//            val receiptItem = ReceiptItem(
//                receiptId = savedReceipt.id,
//                itemName = itemData["itemName"] as? String,
//                quantity = itemData["quantity"] as? BigDecimal,
//                unitPrice = itemData["unitPrice"] as? BigDecimal,
//                totalPrice = itemData["totalPrice"] as? BigDecimal ?: BigDecimal.ZERO,
//                categorySuggestion = itemData["categorySuggestion"] as? String,
//                lineNumber = itemData["lineNumber"] as? Int ?: (index + 1)
//            )
//            receiptItemRepository.save(receiptItem)
//        }
//
//        return mapToDto(savedReceipt, savedItems, emptyList())
//    }
//
//    fun getUserReceipts(userId: Long, page: Int, size: Int): List<ReceiptDto> {
//        val pageable = PageRequest.of(page, size)
//        val receipts = receiptRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
//
//        return receipts.content.map { receipt ->
//            val items = receiptItemRepository.findByReceiptId(receipt.id)
//            val transactions = receiptTransactionRepository.findByReceiptId(receipt.id)
//            mapToDto(receipt, items, transactions)
//        }
//    }
//
//    fun getReceiptById(receiptId: Long, userId: Long): ReceiptDto {
//        val receipt = receiptRepository.findByIdAndUserId(receiptId, userId)
//            ?: throw IllegalArgumentException("Receipt not found")
//
////        val items = receiptItemRepository.findByReceiptId(receiptId)
//        val transactions = receiptTransactionRepository.findByReceiptId(receiptId)
//
//        return mapToDto(receipt, items, transactions)
//    }
//
//    fun verifyReceipt(receiptId: Long, userId: Long, request: VerifyReceiptRequest): ReceiptDto {
////        val receipt = receiptRepository.findByIdAndUserId(receiptId, userId)
//            ?: throw IllegalArgumentException("Receipt not found")
//
//        val verifiedData = mapOf(
//            "merchantName" to request.merchantName,
//            "totalAmount" to request.totalAmount,
//            "taxAmount" to request.taxAmount,
//            "tipAmount" to request.tipAmount,
//            "subtotalAmount" to request.subtotalAmount,
//            "purchaseDate" to request.purchaseDate?.toString()
//        ).filterValues { it != null }
//
//        val updatedReceipt = receipt.copy(
//            verifiedData = verifiedData,
//            isVerified = true,
//            updatedAt = LocalDateTime.now()
//        )
//
////        val savedReceipt = receiptRepository.save(updatedReceipt)
//
//        // Update items if provided
//        if (request.items.isNotEmpty()) {
//            receiptItemRepository.deleteByReceiptId(receiptId)
//
//            request.items.forEachIndexed { index, itemRequest ->
//                val receiptItem = ReceiptItem(
//                    receiptId = receiptId,
//                    itemName = itemRequest.itemName,
//                    quantity = itemRequest.quantity,
//                    unitPrice = itemRequest.unitPrice,
//                    totalPrice = itemRequest.totalPrice,
//                    categorySuggestion = itemRequest.category,
//                    lineNumber = index + 1
//                )
//                receiptItemRepository.save(receiptItem)
//            }
//        }
//
////        val updatedItems = receiptItemRepository.findByReceiptId(receiptId)
//        val transactions = receiptTransactionRepository.findByReceiptId(receiptId)
//
//        return mapToDto(savedReceipt, updatedItems, transactions)
//    }
//
//    fun createTransactionFromReceipt(
//        receiptId: Long,
//        userId: Long,
//        request: CreateTransactionFromReceiptRequest
//    ): TransactionDto {
//        val receipt = receiptRepository.findByIdAndUserId(receiptId, userId)
//            ?: throw IllegalArgumentException("Receipt not found")
//
//        val account = accountRepository.findByIdAndUserId(request.accountId, userId)
//            ?: throw IllegalArgumentException("Account not found")
//
//        val amount = if (request.useExtractedAmount) {
//            receipt.getTotalAmount() ?: BigDecimal.ZERO
//        } else {
//            request.customAmount ?: BigDecimal.ZERO
//        }
//
//        val description = request.description ?: "Purchase from receipt"
//
//        val transaction = Transaction(
//            userId = userId,
//            accountId = request.accountId,
//            categoryId = request.categoryId,
//            amount = amount,
//            description = description,
//            notes = request.notes,
//            type = TransactionType.EXPENSE,
//            date = receipt.getReceiptDate() ?: LocalDateTime.now()
//        )
//
//        val savedTransaction = transactionRepository.save(transaction)
//
//        // Create link between receipt and transaction
//        val receiptTransaction = ReceiptTransaction.create(receiptId, savedTransaction.id)
//        receiptTransactionRepository.save(receiptTransaction)
//
//        // Update account balance
//        account.balance = account.balance.subtract(amount)
//        accountRepository.save(account)
//
//        return TransactionDto(
//            id = savedTransaction.id,
////            userId = savedTransaction.userId,
//            accountId = savedTransaction.accountId,
//            categoryId = savedTransaction.categoryId,
//            amount = savedTransaction.amount,
//            description = savedTransaction.description,
////            notes = savedTransaction.notes,
//            type = savedTransaction.type,
////            date = savedTransaction.date,
//            createdAt = savedTransaction.createdAt,
//            updatedAt = savedTransaction.updatedAt,
//            accountName = account.name,
//            categoryName = null
//        )
//    }
//
//    fun deleteReceipt(receiptId: Long, userId: Long) {
//        val receipt = receiptRepository.findByIdAndUserId(receiptId, userId)
//            ?: throw IllegalArgumentException("Receipt not found")
//
//        receiptTransactionRepository.deleteByReceiptId(receiptId)
//        receiptItemRepository.deleteByReceiptId(receiptId)
//        receiptRepository.delete(receipt)
//    }
//
//    fun getReceiptStats(userId: Long): ReceiptStatsResponse {
//        val totalReceipts = receiptRepository.countByUserId(userId)
//        val verifiedReceipts = receiptRepository.countByUserIdAndIsVerified(userId, true)
//        val unverifiedReceipts = totalReceipts - verifiedReceipts
//
//        val receipts = receiptRepository.findByUserId(userId)
//        val totalAmount = receipts.mapNotNull { it.getTotalAmount() }
//            .fold(BigDecimal.ZERO) { acc, amount -> acc.add(amount) }
//        val averageAmount = if (totalReceipts > 0) {
//            totalAmount.divide(BigDecimal(totalReceipts), 2, BigDecimal.ROUND_HALF_UP)
//        } else BigDecimal.ZERO
//
//        val receiptIds = receipts.mapNotNull { it.id }
//        val totalTransactionsCreated = receiptTransactionRepository.countByReceiptIdIn(receiptIds)
//
//        return ReceiptStatsResponse(
//            totalReceipts = totalReceipts,
//            verifiedReceipts = verifiedReceipts,
//            unverifiedReceipts = unverifiedReceipts,
//            totalAmount = totalAmount,
//            averageAmount = averageAmount,
//            totalTransactionsCreated = totalTransactionsCreated
//        )
//    }
//
//    private fun mapToDto(
//        receipt: Receipt,
//        items: List<ReceiptItem>,
//        transactions: List<ReceiptTransaction>
//    ): ReceiptDto {
//        return ReceiptDto(
//            id = receipt.id,
//            userId = receipt.userId,
//            filePath = receipt.originalImageUrl,
//            fileName = receipt.originalFilename,
//            fileType = receipt.mimeType,
//            fileSize = receipt.fileSize,
//            ocrText = receipt.rawOcrText,
//            ocrConfidence = receipt.ocrConfidence?.toDouble(),
//            merchantName = receipt.extractedData?.get("merchantName") as? String,
//            merchantAddress = receipt.extractedData?.get("address") as? String,
//            merchantPhone = receipt.extractedData?.get("phoneNumber") as? String,
//            totalAmount = receipt.getTotalAmount(),
//            subtotalAmount = receipt.extractedData?.get("subtotal") as? BigDecimal,
//            taxAmount = receipt.extractedData?.get("taxAmount") as? BigDecimal,
//            tipAmount = receipt.extractedData?.get("tipAmount") as? BigDecimal,
//            purchaseDate = receipt.getReceiptDate(),
//            isVerified = receipt.isVerified,
//            createdAt = receipt.createdAt,
//            updatedAt = receipt.updatedAt,
//            items = items.map { item ->
//                ReceiptItemDto(
//                    id = item.id,
//                    receiptId = item.receiptId,
//                    itemName = item.itemName ?: "",
//                    quantity = item.quantity,
//                    unitPrice = item.unitPrice,
//                    totalPrice = item.totalPrice ?: BigDecimal.ZERO,
//                    category = item.categorySuggestion,
//                    lineNumber = item.lineNumber
//                )
//            },
//            transactions = transactions.map { transaction ->
//                ReceiptTransactionDto(
//                    id = transaction.id,
//                    receiptId = transaction.receiptId,
//                    transactionId = transaction.transactionId,
//                    allocatedAmount = BigDecimal.ZERO, // Would need to calculate
//                    notes = null
//                )
//            }
//        )
//    }
//}
