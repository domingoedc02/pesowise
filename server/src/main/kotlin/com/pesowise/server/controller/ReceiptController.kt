package com.pesowise.server.controller

import com.pesowise.server.dto.ReceiptResponse
import com.pesowise.server.dto.ReceiptUploadResponse
import com.pesowise.server.dto.CreateReceiptRequest
import com.pesowise.server.dto.VerifyReceiptRequest
import com.pesowise.server.dto.CreateTransactionFromReceiptRequest
import com.pesowise.server.dto.ReceiptStatsResponse
import com.pesowise.server.service.OCRService
import com.pesowise.server.service.ReceiptParsingService
import com.pesowise.server.service.FileStorageService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import java.util.*

@RestController
@RequestMapping("/api/receipts")
@CrossOrigin(origins = ["http://localhost:3000"])
class ReceiptController(
//    private val receiptControllerService: ReceiptControllerService,
    private val ocrService: OCRService,
    private val receiptParsingService: ReceiptParsingService,
    private val fileStorageService: FileStorageService
) {

    @PostMapping("/upload", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadReceipt(
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ReceiptUploadResponse> {
        return try {
            val userId = userDetails.username
            
            // Validate file
            if (file.isEmpty) {
                return ResponseEntity.badRequest().body(
                    ReceiptUploadResponse(
                        success = false,
                        message = "File is empty",
                        receiptId = null,
                        extractedData = null
                    )
                )
            }
            
            // Store file
            val fileInfo = fileStorageService.storeFile(file, userId)
            
            // Perform OCR
            val ocrResult = ocrService.processImage(fileInfo.url)
            
            // Parse OCR result
            val extractedData = receiptParsingService.parseOCRResult(ocrResult)
            
            // Create receipt record
            val createReceiptRequest = CreateReceiptRequest(
                userId = userId,
                filePath = fileInfo.path,
                fileName = file.originalFilename ?: "receipt.jpg",
                fileType = file.contentType ?: "image/jpeg",
                fileSize = file.size,
                ocrText = ocrResult.text,
                ocrConfidence = ocrResult.confidence.toDouble(),
                extractedData = extractedData
            )
            
//            val receipt = receiptControllerService.createReceipt(createReceiptRequest)

            ResponseEntity.ok(
                ReceiptUploadResponse(
                    success = true,
                    message = "Receipt uploaded and processed successfully",
                    receiptId =1 ,
                    extractedData = extractedData
                )
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(
                ReceiptUploadResponse(
                    success = false,
                    message = "Failed to process receipt: ${e.message}",
                    receiptId = null,
                    extractedData = null
                )
            )
        }
    }

//    @PostMapping("/verify/{receiptId}")
//    fun verifyReceipt(
//        @PathVariable receiptId: Long,
//        @RequestBody request: VerifyReceiptRequest,
//        @AuthenticationPrincipal userDetails: UserDetails
//    ): ResponseEntity<ReceiptResponse> {
//        return try {
//            val userId = userDetails.username.toLong()
//            val receipt = receiptControllerService.verifyReceipt(receiptId, userId, request)
//            ResponseEntity.ok(receipt)
//        } catch (e: Exception) {
//            ResponseEntity.badRequest().build()
//        }
//    }

    @PostMapping("/{receiptId}/create-transaction")
    fun createTransactionFromReceipt(
        @PathVariable receiptId: Long,
        @RequestBody request: CreateTransactionFromReceiptRequest,
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Any> {
        return try {
            val userId = userDetails.username.toLong()
//            val result = receiptControllerService.createTransactionFromReceipt(receiptId, userId, request)
            ResponseEntity.ok("result")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

//    @GetMapping
//    fun getUserReceipts(
//        @AuthenticationPrincipal userDetails: UserDetails,
//        @RequestParam(defaultValue = "0") page: Int,
//        @RequestParam(defaultValue = "20") size: Int
//    ): ResponseEntity<List<ReceiptResponse>> {
//        return try {
//            val userId = userDetails.username.toLong()
//            val receipts = receiptControllerService.getUserReceipts(userId, page, size)
//            ResponseEntity.ok(receipts)
//        } catch (e: Exception) {
//            ResponseEntity.badRequest().build()
//        }
//    }

//    @GetMapping("/{receiptId}")
//    fun getReceipt(
//        @PathVariable receiptId: Long,
//        @AuthenticationPrincipal userDetails: UserDetails
//    ): ResponseEntity<ReceiptResponse> {
//        return try {
//            val userId = userDetails.username.toLong()
//            val receipt = receiptControllerService.getReceiptById(receiptId, userId)
//            ResponseEntity.ok(receipt)
//        } catch (e: Exception) {
//            ResponseEntity.notFound().build()
//        }
//    }

//    @GetMapping("/{receiptId}/image")
//    fun getReceiptImage(
//        @PathVariable receiptId: Long,
//        @AuthenticationPrincipal userDetails: UserDetails
//    ): ResponseEntity<ByteArray> {
//        return try {
//            val userId = userDetails.username.toLong()
////            val receipt = receiptControllerService.getReceiptById(receiptId, userId)
////            val filePath = fileStorageService.getFile(userId, receipt.fileName)
////            val imageBytes = java.nio.file.Files.readAllBytes(filePath)
//
//            ResponseEntity.ok()
////                .contentType(MediaType.parseMediaType(receipt.fileType))
//                .body()
//        } catch (e: Exception) {
//            ResponseEntity.notFound().build()
//        }
//    }

    @DeleteMapping("/{receiptId}")
    fun deleteReceipt(
        @PathVariable receiptId: Long,
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Unit> {
        return try {
            val userId = userDetails.username.toLong()
//            receiptControllerService.deleteReceipt(receiptId, userId)
            ResponseEntity.ok().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

//    @GetMapping("/stats")
//    fun getReceiptStats(
//        @AuthenticationPrincipal userDetails: UserDetails
//    ): ResponseEntity<ReceiptStatsResponse> {
//        return try {
//            val userId = userDetails.username.toLong()
////            val stats = receiptControllerService.getReceiptStats(userId)
//            ResponseEntity.ok()
//        } catch (e: Exception) {
//            ResponseEntity.badRequest().build()
//        }
//    }
}
