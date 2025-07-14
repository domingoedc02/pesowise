package com.pesowise.server.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

data class FileInfo(
    val filename: String,
    val url: String,
    val path: String,
    val size: Long
)

@Service
class FileStorageService(
    @Value("\${app.file-storage.receipts-dir:uploads/receipts}")
    private val receiptsDirectory: String,
    
    @Value("\${app.file-storage.base-url:http://localhost:8080/api/files}")
    private val baseUrl: String
) {

    private val receiptStorageLocation: Path by lazy {
        Paths.get(receiptsDirectory).toAbsolutePath().normalize().also {
            try {
                Files.createDirectories(it)
            } catch (ex: Exception) {
                throw RuntimeException("Could not create the directory where the uploaded files will be stored.", ex)
            }
        }
    }

    fun storeFile(file: MultipartFile, userId: String): FileInfo {
        val originalFilename = file.originalFilename ?: "receipt"
        val filename = generateUniqueFilename(originalFilename, userId)
        
        try {
            // Check for invalid characters
            if (filename.contains("..")) {
                throw RuntimeException("Sorry! Filename contains invalid path sequence $filename")
            }

            // Create user directory if it doesn't exist
            val userDirectory = receiptStorageLocation.resolve("user_$userId")
            Files.createDirectories(userDirectory)

            // Copy file to the target location
            val targetLocation = userDirectory.resolve(filename)
            Files.copy(file.inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING)

            val url = "$baseUrl/receipts/user_$userId/$filename"
            
            return FileInfo(
                filename = filename,
                url = url,
                path = targetLocation.toString(),
                size = file.size
            )
        } catch (ex: IOException) {
            throw RuntimeException("Could not store file $filename. Please try again!", ex)
        }
    }

    fun getFile(userId: String, filename: String): Path {
        val userDirectory = receiptStorageLocation.resolve("user_$userId")
        val filePath = userDirectory.resolve(filename).normalize()
        
        if (!filePath.startsWith(userDirectory)) {
            throw RuntimeException("Invalid file path")
        }
        
        if (!Files.exists(filePath)) {
            throw RuntimeException("File not found: $filename")
        }
        
        return filePath
    }

    fun deleteFile(fileUrl: String): Boolean {
        return try {
            // Extract path from URL
            val pathFromUrl = fileUrl.removePrefix(baseUrl).removePrefix("/receipts/")
            val filePath = receiptStorageLocation.resolve(pathFromUrl).normalize()
            
            // Security check
            if (!filePath.startsWith(receiptStorageLocation)) {
                throw RuntimeException("Invalid file path")
            }
            
            Files.deleteIfExists(filePath)
        } catch (ex: Exception) {
            false
        }
    }

    fun getUserStorageUsage(userId: String): Long {
        val userDirectory = receiptStorageLocation.resolve("user_$userId")
        
        if (!Files.exists(userDirectory)) {
            return 0L
        }
        
        return try {
            Files.walk(userDirectory)
                .filter { Files.isRegularFile(it) }
                .mapToLong { 
                    try { 
                        Files.size(it) 
                    } catch (e: IOException) { 
                        0L 
                    } 
                }
                .sum()
        } catch (ex: IOException) {
            0L
        }
    }

    fun cleanupOldFiles(olderThanDays: Long = 90) {
        val cutoffDate = LocalDateTime.now().minusDays(olderThanDays)
        
        try {
            Files.walk(receiptStorageLocation)
                .filter { Files.isRegularFile(it) }
                .filter { path ->
                    try {
                        val lastModified = Files.getLastModifiedTime(path).toInstant()
                        lastModified.isBefore(cutoffDate.atZone(java.time.ZoneId.systemDefault()).toInstant())
                    } catch (e: IOException) {
                        false
                    }
                }
                .forEach { path ->
                    try {
                        Files.deleteIfExists(path)
                    } catch (e: IOException) {
                        // Log error but continue cleanup
                        println("Failed to delete old file: ${path.fileName}")
                    }
                }
        } catch (ex: IOException) {
            throw RuntimeException("Error during file cleanup", ex)
        }
    }

    private fun generateUniqueFilename(originalFilename: String, userId: String): String {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
        val uuid = UUID.randomUUID().toString().take(8)
        val extension = getFileExtension(originalFilename)
        
        return "receipt_${userId}_${timestamp}_${uuid}${extension}"
    }

    private fun getFileExtension(filename: String): String {
        val dotIndex = filename.lastIndexOf('.')
        return if (dotIndex > 0 && dotIndex < filename.length - 1) {
            filename.substring(dotIndex)
        } else {
            ""
        }
    }

    fun validateFile(file: MultipartFile) {
        if (file.isEmpty) {
            throw IllegalArgumentException("File cannot be empty")
        }
        
        val allowedMimeTypes = setOf(
            "image/jpeg", 
            "image/jpg", 
            "image/png", 
            "image/gif",
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

    fun getFileUrl(userId: String, filename: String): String {
        return "$baseUrl/receipts/user_$userId/$filename"
    }
}
