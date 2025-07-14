package com.pesowise.server.controller

import com.pesowise.server.domain.entity.TransactionType
import com.pesowise.server.dto.*
import com.pesowise.server.service.CategoryService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryService: CategoryService
) {
    
    @GetMapping
    fun getAllCategories(authentication: Authentication): ResponseEntity<List<CategoryDto>> {
        val userId = authentication.name
        val categories = categoryService.getAllCategories(userId)
        return ResponseEntity.ok(categories)
    }
    
    @GetMapping("/type/{type}")
    fun getCategoriesByType(
        @PathVariable type: TransactionType,
        authentication: Authentication
    ): ResponseEntity<List<CategoryDto>> {
        val userId = authentication.name
        val categories = categoryService.getCategoriesByType(userId, type)
        return ResponseEntity.ok(categories)
    }
    
    @GetMapping("/{id}")
    fun getCategoryById(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<CategoryDto> {
        val userId = authentication.name
        val category = categoryService.getCategoryById(userId, id)
        return ResponseEntity.ok(category)
    }
    
    @PostMapping
    fun createCategory(
        @Valid @RequestBody request: CreateCategoryRequest,
        authentication: Authentication
    ): ResponseEntity<CategoryDto> {
        val userId = authentication.name
        val category = categoryService.createCategory(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(category)
    }
    
    @PutMapping("/{id}")
    fun updateCategory(
        @PathVariable id: Long,
        @Valid @RequestBody request: CreateCategoryRequest,
        authentication: Authentication
    ): ResponseEntity<CategoryDto> {
        val userId = authentication.name
        val category = categoryService.updateCategory(userId, id, request)
        return ResponseEntity.ok(category)
    }
    
    @DeleteMapping("/{id}")
    fun deleteCategory(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.name
        categoryService.deleteCategory(userId, id)
        return ResponseEntity.noContent().build()
    }
    
    @GetMapping("/system")
    fun getSystemCategories(): ResponseEntity<List<CategoryDto>> {
        val categories = categoryService.getSystemCategories()
        return ResponseEntity.ok(categories)
    }
}
