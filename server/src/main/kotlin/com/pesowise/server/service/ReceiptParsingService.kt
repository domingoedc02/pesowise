package com.pesowise.server.service

import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class ReceiptParsingService {

    private val amountPattern = Regex("\\$?(\\d+[.,]\\d{2})")
    private val datePattern = Regex("\\b(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\b")
    private val timePattern = Regex("\\b(\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[AP]M)?)\\b", RegexOption.IGNORE_CASE)
    private val phonePattern = Regex("\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}")
    
    private val merchantKeywords = setOf(
        "store", "shop", "market", "restaurant", "cafe", "coffee", "gas", "station",
        "pharmacy", "grocery", "mall", "center", "inc", "corp", "ltd", "llc"
    )
    
    private val totalKeywords = setOf(
        "total", "amount", "balance", "due", "payment", "charge"
    )
    
    private val subtotalKeywords = setOf(
        "subtotal", "sub total", "sub-total", "subtot"
    )
    
    private val taxKeywords = setOf(
        "tax", "gst", "hst", "pst", "vat", "sales tax"
    )
    
    private val tipKeywords = setOf(
        "tip", "gratuity", "service charge"
    )

    fun parseOCRResult(ocrResult: OCRResult): Map<String, Any> {
        val lines = ocrResult.text.lines().map { it.trim() }.filter { it.isNotEmpty() }
        
        val extractedData = mutableMapOf<String, Any>()
        
        // Extract merchant name (usually first few lines)
        extractMerchantName(lines)?.let { extractedData["merchantName"] = it }
        
        // Extract amounts
        val amounts = extractAmounts(lines)
        extractedData.putAll(amounts)
        
        // Extract date and time
        extractDate(ocrResult.text)?.let { extractedData["date"] = it }
        extractTime(ocrResult.text)?.let { extractedData["time"] = it }
        
        // Extract address and phone
        extractAddress(lines)?.let { extractedData["address"] = it }
        extractPhoneNumber(ocrResult.text)?.let { extractedData["phoneNumber"] = it }
        
        // Extract line items
        extractedData["items"] = extractLineItems(lines)
        
        // Add confidence score
        extractedData["confidence"] = ocrResult.confidence
        
        return extractedData.filterValues { it != null }
    }

    private fun extractMerchantName(lines: List<String>): String? {
        // Look for merchant name in first few lines
        for (i in 0 until minOf(5, lines.size)) {
            val line = lines[i]
            
            // Skip lines that look like addresses or phone numbers
            if (line.contains(Regex("\\d{3,}"))) continue
            if (line.length < 3) continue
            
            // Check if line contains merchant keywords or looks like a business name
            val cleanLine = line.replace(Regex("[^A-Za-z\\s]"), "").trim()
            if (cleanLine.length >= 3 && (
                merchantKeywords.any { cleanLine.lowercase().contains(it) } ||
                cleanLine.split(" ").size <= 4
            )) {
                return cleanLine
            }
        }
        
        // Fallback: return first substantial line
        return lines.firstOrNull { it.length >= 3 && !it.contains(Regex("\\d{10,}")) }
    }

    private fun extractAmounts(lines: List<String>): Map<String, BigDecimal> {
        val amounts = mutableMapOf<String, BigDecimal>()
        
        for (line in lines) {
            val lowerLine = line.lowercase()
            val amountMatches = amountPattern.findAll(line).toList()
            
            if (amountMatches.isNotEmpty()) {
                val amount = parseAmount(amountMatches.last().groupValues[1])
                
                when {
                    totalKeywords.any { lowerLine.contains(it) } && !amounts.containsKey("totalAmount") -> {
                        amounts["totalAmount"] = amount
                    }
                    subtotalKeywords.any { lowerLine.contains(it) } && !amounts.containsKey("subtotal") -> {
                        amounts["subtotal"] = amount
                    }
                    taxKeywords.any { lowerLine.contains(it) } && !amounts.containsKey("taxAmount") -> {
                        amounts["taxAmount"] = amount
                    }
                    tipKeywords.any { lowerLine.contains(it) } && !amounts.containsKey("tipAmount") -> {
                        amounts["tipAmount"] = amount
                    }
                }
            }
        }
        
        // If no total found, try to find the largest amount
        if (!amounts.containsKey("totalAmount")) {
            val allAmounts = lines.flatMap { line ->
                amountPattern.findAll(line).map { parseAmount(it.groupValues[1]) }
            }
            
            if (allAmounts.isNotEmpty()) {
                amounts["totalAmount"] = allAmounts.maxOrNull() ?: BigDecimal.ZERO
            }
        }
        
        return amounts
    }

    private fun extractDate(text: String): String? {
        val matchResult = datePattern.find(text)
        if (matchResult != null) {
            val dateStr = matchResult.groupValues[1]
            return try {
                // Try to parse and format consistently
                val formats = listOf(
                    DateTimeFormatter.ofPattern("M/d/yyyy"),
                    DateTimeFormatter.ofPattern("M/d/yy"),
                    DateTimeFormatter.ofPattern("M-d-yyyy"),
                    DateTimeFormatter.ofPattern("M-d-yy"),
                    DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                    DateTimeFormatter.ofPattern("MM/dd/yy")
                )
                
                for (format in formats) {
                    try {
                        val date = LocalDate.parse(dateStr, format)
                        return date.toString()
                    } catch (e: Exception) {
                        continue
                    }
                }
                
                dateStr
            } catch (e: Exception) {
                dateStr
            }
        }
        return null
    }

    private fun extractTime(text: String): String? {
        val matchResult = timePattern.find(text)
        return if (matchResult != null) {
            matchResult.groupValues[1]
        } else null
    }

    private fun extractAddress(lines: List<String>): String? {
        // Look for lines that might be addresses
        for (line in lines) {
            if (line.contains(Regex("\\d+\\s+[A-Za-z]")) || // Street number and name
                line.lowercase().contains("street") ||
                line.lowercase().contains("avenue") ||
                line.lowercase().contains("road") ||
                line.lowercase().contains("blvd") ||
                line.contains(Regex("\\w+,\\s*\\w+\\s+\\d{5}")) // City, State ZIP
            ) {
                return line
            }
        }
        return null
    }

    private fun extractPhoneNumber(text: String): String? {
        val matchResult = phonePattern.find(text)
        return if (matchResult != null) {
            matchResult.value
        } else null
    }

    private fun extractLineItems(lines: List<String>): List<Map<String, Any>> {
        val items = mutableListOf<Map<String, Any>>()
        
        for (i in lines.indices) {
            val line = lines[i]
            
            // Skip header lines, totals, etc.
            if (shouldSkipLine(line)) continue
            
            val amounts = amountPattern.findAll(line).toList()
            if (amounts.isNotEmpty()) {
                val amount = parseAmount(amounts.last().groupValues[1])
                
                // Extract item name (text before the amount)
                val amountText = amounts.last().value
                val itemName = line.substringBefore(amountText).trim()
                
                if (itemName.isNotBlank() && itemName.length > 2) {
                    val item = mutableMapOf<String, Any>(
                        "itemName" to cleanItemName(itemName),
                        "totalPrice" to amount,
                        "lineNumber" to (i + 1)
                    )
                    
                    // Try to extract quantity and unit price
                    val quantityMatch = Regex("(\\d+)\\s*x\\s*\\$?([\\d.]+)").find(line)
                    if (quantityMatch != null) {
                        item["quantity"] = BigDecimal(quantityMatch.groupValues[1])
                        item["unitPrice"] = parseAmount(quantityMatch.groupValues[2])
                    }
                    
                    // Suggest category based on item name
                    suggestCategory(itemName)?.let { item["categorySuggestion"] = it }
                    
                    items.add(item)
                }
            }
        }
        
        return items
    }

    private fun shouldSkipLine(line: String): Boolean {
        val lowerLine = line.lowercase()
        
        return lowerLine.contains("total") ||
               lowerLine.contains("subtotal") ||
               lowerLine.contains("tax") ||
               lowerLine.contains("tip") ||
               lowerLine.contains("payment") ||
               lowerLine.contains("thank you") ||
               lowerLine.contains("receipt") ||
               lowerLine.contains("change") ||
               lowerLine.contains("cash") ||
               lowerLine.contains("credit") ||
               lowerLine.contains("debit") ||
               line.length < 3 ||
               line.contains(Regex("^[\\d\\s/:-]+$")) // Date/time only lines
    }

    private fun cleanItemName(itemName: String): String {
        return itemName
            .replace(Regex("\\d+\\s*x\\s*"), "") // Remove quantity indicators
            .replace(Regex("\\$[\\d.]+"), "") // Remove any prices
            .replace(Regex("[^A-Za-z0-9\\s]"), " ") // Remove special chars
            .replace(Regex("\\s+"), " ") // Normalize whitespace
            .trim()
            .split(" ")
            .joinToString(" ") { word -> 
                word.lowercase().replaceFirstChar { it.uppercase() }
            }
    }

    private fun suggestCategory(itemName: String): String? {
        val lowerName = itemName.lowercase()
        
        return when {
            lowerName.contains("milk") || lowerName.contains("cheese") || 
            lowerName.contains("butter") || lowerName.contains("yogurt") -> "Dairy"
            
            lowerName.contains("bread") || lowerName.contains("rice") ||
            lowerName.contains("pasta") || lowerName.contains("cereal") -> "Grains"
            
            lowerName.contains("apple") || lowerName.contains("banana") ||
            lowerName.contains("orange") || lowerName.contains("fruit") -> "Fruits"
            
            lowerName.contains("carrot") || lowerName.contains("lettuce") ||
            lowerName.contains("vegetable") || lowerName.contains("tomato") -> "Vegetables"
            
            lowerName.contains("chicken") || lowerName.contains("beef") ||
            lowerName.contains("fish") || lowerName.contains("meat") -> "Meat"
            
            lowerName.contains("gas") || lowerName.contains("fuel") -> "Transportation"
            
            lowerName.contains("coffee") || lowerName.contains("tea") ||
            lowerName.contains("soda") || lowerName.contains("juice") -> "Beverages"
            
            else -> "Other"
        }
    }

    private fun parseAmount(amountStr: String): BigDecimal {
        return try {
            BigDecimal(amountStr.replace(",", "."))
        } catch (e: Exception) {
            BigDecimal.ZERO
        }
    }
}
