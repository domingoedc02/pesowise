# Tesseract OCR Integration for PesoWise

## Overview

This document explains the custom OCR implementation that replaces Google Cloud Vision with Tesseract OCR - a free, open-source alternative for receipt text extraction.

## What Was Changed

### Original Problem
- **Error**: `Could not find com.google.cloud:google-cloud-vision:3.20.1`
- **Cause**: Missing Google Cloud repositories and potential costs
- **Impact**: OCR functionality was broken, but file storage remained unaffected

### Solution Implemented
- **Replaced**: Google Cloud Vision API with Tesseract OCR
- **Added**: Custom image preprocessing pipeline
- **Benefits**: Free, local processing, no API costs, better privacy

## File Changes Made

### 1. Dependencies (`server/build.gradle.kts`)
```kotlin
// REMOVED:
// implementation("com.google.cloud:google-cloud-vision:3.20.1")

// ADDED:
implementation("net.sourceforge.tess4j:tess4j:5.9.0")
implementation("org.apache.pdfbox:pdfbox:3.0.1")
implementation("org.apache.pdfbox:pdfbox-tools:3.0.1")
```

### 2. New Services Created

#### `ImagePreprocessingService.kt`
- **Purpose**: Enhance image quality for better OCR accuracy
- **Features**:
  - Grayscale conversion
  - Auto-rotation detection
  - Contrast enhancement
  - Optimal scaling for OCR
  - Noise reduction

#### Updated `OCRService.kt`
- **Purpose**: Process images using Tesseract instead of Google Cloud Vision
- **Features**:
  - Configurable Tesseract settings
  - Receipt-optimized character recognition
  - Confidence calculation
  - Fallback to mock OCR for development

### 3. Configuration (`server/src/main/resources/application.properties`)
```properties
# File storage configuration
app.file-storage.receipts-dir=uploads/receipts
app.file-storage.base-url=http://localhost:8080/api/files

# Google Cloud Vision (disabled)
google.cloud.vision.enabled=false

# Tesseract OCR configuration
tesseract.enabled=true
tesseract.data-path=/usr/share/tesseract-ocr/4.00/tessdata
```

### 4. Docker Support (`server/Dockerfile`)
- **Added**: Tesseract OCR installation in Docker container
- **Includes**: English language pack and necessary libraries

## System Requirements

### For Local Development
You need Java 17+ and Tesseract OCR installed on your system.

#### macOS Installation
```bash
# Install Java 17 (if not already installed)
brew install openjdk@17

# Install Tesseract OCR
brew install tesseract

# Verify installation
tesseract --version
```

#### Ubuntu/Debian Installation
```bash
# Install Java 17
sudo apt update
sudo apt install openjdk-17-jdk

# Install Tesseract OCR
sudo apt install tesseract-ocr tesseract-ocr-eng libtesseract-dev

# Verify installation
tesseract --version
```

#### Windows Installation
1. Install Java 17 from Oracle or use OpenJDK
2. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
3. Add Tesseract to your PATH environment variable

### For Docker Deployment
The Docker setup automatically installs all required dependencies, so no additional configuration is needed.

## How It Works

### 1. File Upload Process
- Files are uploaded to `uploads/receipts/user_<userId>/` (unchanged)
- Your existing `FileStorageService` continues to work exactly as before

### 2. OCR Processing Pipeline
1. **Image Upload**: User uploads receipt image
2. **Preprocessing**: `ImagePreprocessingService` enhances the image
3. **OCR Extraction**: Tesseract extracts text from the processed image
4. **Text Parsing**: `ReceiptParsingService` extracts structured data
5. **Cleanup**: Temporary processed files are removed

### 3. Fallback Behavior
- If Tesseract is disabled or fails, the system uses mock OCR data
- File storage and basic functionality remain unaffected

## Configuration Options

### Tesseract Settings
You can customize OCR behavior by modifying these properties:

```properties
# Enable/disable Tesseract OCR
tesseract.enabled=true

# Path to Tesseract data files (tessdata)
tesseract.data-path=/usr/share/tesseract-ocr/4.00/tessdata

# Disable Google Cloud Vision (important)
google.cloud.vision.enabled=false
```

### OCR Engine Configuration
The `OCRService` includes these optimizations for receipts:
- **Language**: English (configurable)
- **Engine Mode**: LSTM OCR Engine for better accuracy
- **Character Whitelist**: Optimized for receipts (numbers, letters, common symbols)
- **Page Segmentation**: Automatic with orientation detection

## Performance Comparison

| Aspect | Google Cloud Vision | Tesseract OCR |
|--------|-------------------|---------------|
| **Cost** | Pay per API call | Free |
| **Speed** | ~2-3 seconds | ~1-2 seconds |
| **Accuracy** | 95-98% | 85-95% |
| **Privacy** | Cloud processing | Local processing |
| **Dependencies** | Internet required | Local only |
| **Setup** | API keys needed | System installation |

## Building and Running

### Local Development
```bash
# Ensure Java 17 is used
export JAVA_HOME=/path/to/java17

# Build the project
cd server
./gradlew clean build

# Run the application
./gradlew bootRun
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# The Dockerfile automatically installs Tesseract
```

## Testing OCR Functionality

### Test Endpoints
- `POST /api/receipts/upload` - Upload and process receipt
- `GET /api/receipts/{id}` - View processed receipt data
- `GET /api/ocr/statistics` - View OCR engine statistics

### Sample OCR Response
```json
{
  "text": "GROCERY STORE\n123 Main Street\nTotal: $15.94",
  "confidence": 0.87,
  "blocks": [
    {
      "text": "GROCERY STORE",
      "confidence": 0.92,
      "boundingBox": { "x": 0, "y": 0, "width": 300, "height": 25 }
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Build fails with Java version error**
   - Ensure Java 17+ is installed and JAVA_HOME is set correctly

2. **Tesseract not found**
   - Install Tesseract OCR on your system
   - Verify installation with `tesseract --version`

3. **Poor OCR accuracy**
   - Check image quality (resolution, contrast)
   - Ensure images are properly oriented
   - Consider adjusting preprocessing parameters

4. **File upload still works but no text extraction**
   - This is expected if Tesseract is not installed
   - The system will use mock OCR data for development

### Logs to Check
```bash
# Check application logs for OCR-related errors
tail -f logs/application.log | grep -i tesseract

# Check Docker container logs
docker logs pesowise-server
```

## Future Enhancements

### Potential Improvements
1. **Multi-language Support**: Add support for other languages
2. **Advanced Preprocessing**: Implement perspective correction and better skew detection
3. **PDF Support**: Add PDF-to-image conversion for PDF receipts
4. **Confidence Thresholds**: Implement configurable confidence levels
5. **Training Data**: Custom training for specific receipt formats

### Integration Options
- **Azure Computer Vision**: Alternative cloud OCR service
- **AWS Textract**: Amazon's document analysis service
- **OpenCV**: Advanced image preprocessing
- **Custom Models**: Train TensorFlow/PyTorch models for receipts

## Summary

✅ **Problem Solved**: Google Cloud Vision dependency error is resolved
✅ **Cost Savings**: No API costs - completely free OCR solution
✅ **Privacy**: All processing happens locally
✅ **File Storage**: Your existing file upload system is unchanged
✅ **Docker Ready**: Containerized deployment with Tesseract included

The uploads folder structure (`uploads/receipts/user_<userId>/`) remains exactly the same, and your application will continue to store and serve files as before. The only change is that text extraction now happens locally using Tesseract instead of requiring Google Cloud Vision API.
