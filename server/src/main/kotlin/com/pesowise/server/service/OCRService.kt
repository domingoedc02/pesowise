package com.pesowise.server.service

import net.sourceforge.tess4j.Tesseract
import net.sourceforge.tess4j.TesseractException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.File
import java.math.BigDecimal
import java.awt.image.BufferedImage
import javax.imageio.ImageIO

data class OCRResult(
    val text: String,
    val confidence: BigDecimal,
    val blocks: List<TextBlock>,
    val boundingBoxes: List<BoundingBox>
)

data class TextBlock(
    val text: String,
    val confidence: Float,
    val boundingBox: BoundingBox,
    val words: List<Word>
)

data class Word(
    val text: String,
    val confidence: Float,
    val boundingBox: BoundingBox
)

data class BoundingBox(
    val x: Int,
    val y: Int,
    val width: Int,
    val height: Int
)

@Service
class OCRService(
    @Value("\${tesseract.enabled:true}")
    private val tesseractEnabled: Boolean,
    
    @Value("\${tesseract.data-path:/usr/share/tesseract-ocr/4.00/tessdata}")
    private val tesseractDataPath: String,
    
    private val imagePreprocessingService: ImagePreprocessingService
) {

    fun processImage(imageUrl: String): OCRResult {
        return if (tesseractEnabled) {
            processWithTesseract(imageUrl)
        } else {
            // Fallback to mock OCR for development
            processMockOCR(imageUrl)
        }
    }

    private fun processWithTesseract(imageUrl: String): OCRResult {
        try {
            // Convert URL to file path
            val imagePath = extractFilePathFromUrl(imageUrl)
            
            // Preprocess image for better OCR accuracy
            val preprocessedPath = imagePreprocessingService.preprocessForOCR(imagePath)
            
            val tesseract = configureTesseract()
            
            // Read the preprocessed image
            val image = ImageIO.read(File(preprocessedPath))
            
            // Perform OCR
            val text = tesseract.doOCR(image)
            
            // Calculate confidence (Tesseract doesn't provide detailed confidence per word like Google Vision)
            // We'll use a heuristic based on text length and character recognition
            val confidence = calculateConfidence(text)
            
            // Create simplified text blocks from the extracted text
            val blocks = createTextBlocks(text, image.width, image.height)
            
            // Cleanup preprocessed files
            imagePreprocessingService.cleanupPreprocessedFiles(imagePath)
            
            return OCRResult(
                text = text.trim(),
                confidence = confidence,
                blocks = blocks,
                boundingBoxes = blocks.map { it.boundingBox }
            )
            
        } catch (e: TesseractException) {
            throw RuntimeException("OCR processing failed", e)
        } catch (e: Exception) {
            throw RuntimeException("Failed to process image with Tesseract", e)
        }
    }

    private fun configureTesseract(): Tesseract {
        val tesseract = Tesseract()
        
        // Set Tesseract data path
        if (File(tesseractDataPath).exists()) {
            tesseract.setDatapath(tesseractDataPath)
        }
        
        // Set language (English by default, can be made configurable)
        tesseract.setLanguage("eng")
        
        // Configure OCR Engine Mode
        tesseract.setOcrEngineMode(1) // LSTM OCR Engine
        
        // Configure Page Segmentation Mode
        tesseract.setPageSegMode(1) // Automatic page segmentation with OSD
        
        // Additional configurations for better receipt recognition
        tesseract.setVariable("tessedit_char_whitelist", "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:-$€£¥₹ ")
        
        return tesseract
    }

    private fun calculateConfidence(text: String): BigDecimal {
        // Simple confidence calculation based on text characteristics
        // In a real implementation, you might want to use Tesseract's confidence API
        
        if (text.isBlank()) return BigDecimal.ZERO
        
        val totalChars = text.length
        val recognizableChars = text.count { it.isLetterOrDigit() || it in ".,:-$€£¥₹ " }
        val ratio = recognizableChars.toDouble() / totalChars
        
        // Additional factors for receipt-like content
        val hasNumbers = text.any { it.isDigit() }
        val hasCurrency = text.contains(Regex("[$€£¥₹]"))
        val hasDatePattern = text.contains(Regex("""\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"""))
        
        var confidence = ratio * 0.8
        if (hasNumbers) confidence += 0.1
        if (hasCurrency) confidence += 0.05
        if (hasDatePattern) confidence += 0.05
        
        return BigDecimal.valueOf(confidence.coerceIn(0.0, 1.0))
    }

    private fun createTextBlocks(text: String, imageWidth: Int, imageHeight: Int): List<TextBlock> {
        // Since Tesseract doesn't provide detailed bounding box info by default,
        // we'll create simplified blocks based on lines
        
        val lines = text.split('\n').filter { it.isNotBlank() }
        val lineHeight = if (lines.isNotEmpty()) imageHeight / lines.size else imageHeight
        
        return lines.mapIndexed { index, line ->
            val words = line.split(Regex("\\s+")).filter { it.isNotBlank() }
            val wordWidth = if (words.isNotEmpty()) imageWidth / words.size else imageWidth
            
            val boundingBox = BoundingBox(
                x = 0,
                y = index * lineHeight,
                width = imageWidth,
                height = lineHeight
            )
            
            val wordObjects = words.mapIndexed { wordIndex, word ->
                Word(
                    text = word,
                    confidence = 0.85f, // Default confidence for words
                    boundingBox = BoundingBox(
                        x = wordIndex * wordWidth,
                        y = index * lineHeight,
                        width = wordWidth,
                        height = lineHeight
                    )
                )
            }
            
            TextBlock(
                text = line,
                confidence = 0.85f, // Default confidence for text blocks
                boundingBox = boundingBox,
                words = wordObjects
            )
        }
    }

    private fun extractFilePathFromUrl(url: String): String {
        // Extract file path from URL
        // This assumes local file storage. For cloud storage, you'd need different logic
        val pathPart = url.substringAfter("/api/files/receipts/")
        return "uploads/receipts/$pathPart"
    }

    private fun processMockOCR(imageUrl: String): OCRResult {
        // Mock OCR for development/testing
        val mockText = """
            GROCERY STORE
            123 Main Street
            City, State 12345
            Tel: (555) 123-4567
            
            Date: 2024-01-15
            Time: 14:30
            
            Apples          $3.99
            Bread           $2.49
            Milk            $4.29
            Eggs            $3.99
            
            Subtotal:      $14.76
            Tax:            $1.18
            Total:         $15.94
            
            Payment: Credit Card
            Thank you for shopping!
        """.trimIndent()

        val mockBoundingBox = BoundingBox(0, 0, 300, 400)
        val mockWords = mockText.split(Regex("\\s+")).map { word ->
            Word(
                text = word,
                confidence = 0.95f,
                boundingBox = mockBoundingBox
            )
        }

        val mockBlock = TextBlock(
            text = mockText,
            confidence = 0.95f,
            boundingBox = mockBoundingBox,
            words = mockWords
        )

        return OCRResult(
            text = mockText,
            confidence = BigDecimal.valueOf(0.95),
            blocks = listOf(mockBlock),
            boundingBoxes = listOf(mockBoundingBox)
        )
    }

    fun extractTextFromPdf(pdfUrl: String): OCRResult {
        // TODO: Implement PDF to image conversion using PDFBox, then OCR
        // For now, throw unsupported operation
        throw UnsupportedOperationException("PDF OCR will be implemented in the next version")
    }

    fun preprocessImage(imageUrl: String): String {
        // Use the image preprocessing service
        val imagePath = extractFilePathFromUrl(imageUrl)
        return imagePreprocessingService.preprocessForOCR(imagePath)
    }

    fun isImageSupported(mimeType: String): Boolean {
        return when (mimeType) {
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/tiff" -> true
            "application/pdf" -> true // PDF support can be added later
            else -> false
        }
    }

    fun estimateProcessingTime(fileSize: Long): Long {
        // Estimate processing time in milliseconds based on file size
        // Tesseract is generally faster than cloud APIs due to no network overhead
        return when {
            fileSize < 1024 * 1024 -> 1500L // < 1MB: 1.5 seconds
            fileSize < 5 * 1024 * 1024 -> 3000L // < 5MB: 3 seconds
            else -> 6000L // > 5MB: 6 seconds
        }
    }

    fun getOCRStatistics(): Map<String, Any> {
        return mapOf(
            "engine" to "Tesseract",
            "version" to "5.x",
            "languages" to listOf("eng"),
            "supportedFormats" to listOf("PNG", "JPEG", "GIF", "BMP", "TIFF"),
            "isLocal" to true,
            "estimatedAccuracy" to "85-95%"
        )
    }
}
