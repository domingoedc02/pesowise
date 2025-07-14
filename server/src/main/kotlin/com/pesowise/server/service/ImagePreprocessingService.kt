package com.pesowise.server.service

import org.imgscalr.Scalr
import org.springframework.stereotype.Service
import java.awt.Color
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import kotlin.math.*

@Service
class ImagePreprocessingService {

    fun preprocessForOCR(imagePath: String): String {
        try {
            val originalImage = ImageIO.read(File(imagePath))
            
            // Apply preprocessing pipeline
            var processedImage = originalImage
            
            // 1. Convert to grayscale
            processedImage = convertToGrayscale(processedImage)
            
            // 2. Auto-rotate if needed (detect and correct skew)
            processedImage = autoRotate(processedImage)
            
            // 3. Enhance contrast
            processedImage = enhanceContrast(processedImage)
            
            // 4. Scale to optimal size for OCR
            processedImage = scaleForOCR(processedImage)
            
            // 5. Reduce noise
            processedImage = reduceNoise(processedImage)
            
            // Save preprocessed image
            val preprocessedPath = imagePath.replace(".", "_preprocessed.")
            ImageIO.write(processedImage, "png", File(preprocessedPath))
            
            return preprocessedPath
        } catch (e: Exception) {
            // If preprocessing fails, return original path
            return imagePath
        }
    }

    private fun convertToGrayscale(image: BufferedImage): BufferedImage {
        val grayImage = BufferedImage(image.width, image.height, BufferedImage.TYPE_BYTE_GRAY)
        val graphics = grayImage.createGraphics()
        graphics.drawImage(image, 0, 0, null)
        graphics.dispose()
        return grayImage
    }

    private fun autoRotate(image: BufferedImage): BufferedImage {
        // Simple rotation detection based on text lines
        // For more sophisticated rotation detection, you might want to use 
        // Hough Transform or other line detection algorithms
        
        val rotationAngle = detectSkewAngle(image)
        
        return if (abs(rotationAngle) > 1.0) {
            rotateImage(image, -rotationAngle)
        } else {
            image
        }
    }

    private fun detectSkewAngle(image: BufferedImage): Double {
        // Simplified skew detection
        // In a production environment, you might want to implement
        // more sophisticated algorithms like projection profiles
        
        // For now, return 0 (no rotation needed)
        // This can be enhanced with actual skew detection algorithms
        return 0.0
    }

    private fun rotateImage(image: BufferedImage, angle: Double): BufferedImage {
        val radians = Math.toRadians(angle)
        val sin = abs(sin(radians))
        val cos = abs(cos(radians))
        
        val newWidth = (image.width * cos + image.height * sin).toInt()
        val newHeight = (image.width * sin + image.height * cos).toInt()
        
        val rotated = BufferedImage(newWidth, newHeight, image.type)
        val graphics = rotated.createGraphics()
        
        graphics.translate(newWidth / 2, newHeight / 2)
        graphics.rotate(radians)
        graphics.translate(-image.width / 2, -image.height / 2)
        graphics.drawImage(image, 0, 0, null)
        graphics.dispose()
        
        return rotated
    }

    private fun enhanceContrast(image: BufferedImage): BufferedImage {
        val enhanced = BufferedImage(image.width, image.height, image.type)
        
        for (x in 0 until image.width) {
            for (y in 0 until image.height) {
                val rgb = image.getRGB(x, y)
                val color = Color(rgb)
                
                // Apply contrast enhancement
                val gray = color.red // Since it's already grayscale
                val enhancedPixel = enhancePixelContrast(gray)
                
                val newColor = Color(enhancedPixel, enhancedPixel, enhancedPixel)
                enhanced.setRGB(x, y, newColor.rgb)
            }
        }
        
        return enhanced
    }

    private fun enhancePixelContrast(value: Int): Int {
        // Simple contrast enhancement using gamma correction
        val gamma = 0.7 // Adjust this value for different contrast levels
        val normalized = value / 255.0
        val enhanced = normalized.pow(gamma)
        return (enhanced * 255).coerceIn(0.0, 255.0).toInt()
    }

    private fun scaleForOCR(image: BufferedImage): BufferedImage {
        // Tesseract works best with images that have text height of 20-40 pixels
        // Scale image if it's too small or too large
        
        val targetHeight = 800 // Target height for good OCR results
        val currentHeight = image.height
        
        return when {
            currentHeight < 400 -> {
                // Scale up small images
                val scaleFactor = targetHeight.toDouble() / currentHeight
                Scalr.resize(image, Scalr.Method.QUALITY, (image.width * scaleFactor).toInt(), targetHeight)
            }
            currentHeight > 2000 -> {
                // Scale down very large images
                val scaleFactor = targetHeight.toDouble() / currentHeight
                Scalr.resize(image, Scalr.Method.QUALITY, (image.width * scaleFactor).toInt(), targetHeight)
            }
            else -> image
        }
    }

    private fun reduceNoise(image: BufferedImage): BufferedImage {
        // Apply median filter to reduce noise
        val filtered = BufferedImage(image.width, image.height, image.type)
        
        for (x in 1 until image.width - 1) {
            for (y in 1 until image.height - 1) {
                val pixels = mutableListOf<Int>()
                
                // Collect 3x3 neighborhood
                for (dx in -1..1) {
                    for (dy in -1..1) {
                        val rgb = image.getRGB(x + dx, y + dy)
                        val color = Color(rgb)
                        pixels.add(color.red) // Grayscale value
                    }
                }
                
                // Apply median filter
                pixels.sort()
                val median = pixels[pixels.size / 2]
                
                val newColor = Color(median, median, median)
                filtered.setRGB(x, y, newColor.rgb)
            }
        }
        
        // Copy border pixels
        for (x in 0 until image.width) {
            filtered.setRGB(x, 0, image.getRGB(x, 0))
            filtered.setRGB(x, image.height - 1, image.getRGB(x, image.height - 1))
        }
        for (y in 0 until image.height) {
            filtered.setRGB(0, y, image.getRGB(0, y))
            filtered.setRGB(image.width - 1, y, image.getRGB(image.width - 1, y))
        }
        
        return filtered
    }

    fun cleanupPreprocessedFiles(originalPath: String) {
        try {
            val preprocessedPath = originalPath.replace(".", "_preprocessed.")
            val preprocessedFile = File(preprocessedPath)
            if (preprocessedFile.exists()) {
                preprocessedFile.delete()
            }
        } catch (e: Exception) {
            // Ignore cleanup errors
        }
    }
}
