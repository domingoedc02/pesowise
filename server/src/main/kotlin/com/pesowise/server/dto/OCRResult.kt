package com.pesowise.server.dto

data class OCRResult(
    val text: String,
    val confidence: Double,
    val boundingBoxes: List<BoundingBox>? = null,
    val words: List<WordInfo>? = null
)

data class BoundingBox(
    val x: Int,
    val y: Int,
    val width: Int,
    val height: Int
)

data class WordInfo(
    val text: String,
    val confidence: Double,
    val boundingBox: BoundingBox
)
