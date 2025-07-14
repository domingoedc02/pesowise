package com.pesowise.server.service

import com.pesowise.server.domain.entity.Category
import com.pesowise.server.domain.entity.TransactionType
import com.pesowise.server.domain.repository.CategoryRepository
import com.pesowise.server.domain.repository.UserRepository
import com.pesowise.server.dto.*
import com.pesowise.server.exception.ResourceNotFoundException
import com.pesowise.server.exception.BadRequestException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val userRepository: UserRepository,
    private val auditService: AuditService
) {
    
    fun getAllCategories(userId: String): List<CategoryDto> {
        val categories = categoryRepository.findAllAvailableForUser(userId)
        return buildCategoryTree(categories)
    }
    
    fun getCategoriesByType(userId: String, type: TransactionType): List<CategoryDto> {
        val categories = categoryRepository.findAllAvailableForUserByType(userId, type)
        return buildCategoryTree(categories)
    }
    
    fun getCategoryById(userId: String, categoryId: Long): CategoryDto {
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { ResourceNotFoundException("Category not found") }
        
        // Check if user has access to this category
        if (category.user != null && category.user!!.id != userId) {
            throw ResourceNotFoundException("Category not found")
        }
        
        return category.toDto()
    }
    
    fun createCategory(userId: String, request: CreateCategoryRequest): CategoryDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }
        
        // Check if category name already exists for user
        if (categoryRepository.existsByNameAndUserId(request.name, userId)) {
            throw BadRequestException("Category with name '${request.name}' already exists")
        }
        
        // Validate parent category if provided
        var parentCategory: Category? = null
        if (request.parentId != null) {
            parentCategory = categoryRepository.findById(request.parentId)
                .orElseThrow { ResourceNotFoundException("Parent category not found") }
            
            // Check if user has access to parent category
            if (parentCategory.user != null && parentCategory.user!!.id != userId) {
                throw ResourceNotFoundException("Parent category not found")
            }
            
            // Ensure parent and child have same type
            if (parentCategory.type != request.type) {
                throw BadRequestException("Parent and child categories must have the same type")
            }
        }
        
        val category = Category(
            user = user,
            name = request.name,
            type = request.type,
            icon = request.icon,
            color = request.color,
            parent = parentCategory
        )
        
        val savedCategory = categoryRepository.save(category)
        auditService.logUserAction(user.id, "category_created", "Created category: ${savedCategory.name}")
        
        return savedCategory.toDto()
    }
    
    fun updateCategory(userId: String, categoryId: Long, request: CreateCategoryRequest): CategoryDto {
        val category = categoryRepository.findByUserIdAndId(userId, categoryId)
            ?: throw ResourceNotFoundException("Category not found")
        
        if (category.isSystem) {
            throw BadRequestException("System categories cannot be modified")
        }
        
        category.name = request.name
        category.icon = request.icon
        category.color = request.color
        
        val updatedCategory = categoryRepository.save(category)
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "category_updated", "Updated category: ${updatedCategory.name}")
        
        return updatedCategory.toDto()
    }
    
    fun deleteCategory(userId: String, categoryId: Long) {
        val category = categoryRepository.findByUserIdAndId(userId, categoryId)
            ?: throw ResourceNotFoundException("Category not found")
        
        if (category.isSystem) {
            throw BadRequestException("System categories cannot be deleted")
        }
        
        category.isActive = false
        categoryRepository.save(category)
        
        val user = userRepository.findById(userId).orElseThrow { ResourceNotFoundException("User not found") }
        auditService.logUserAction(user.id, "category_deleted", "Deleted category: ${category.name}")
    }
    
    fun getSystemCategories(): List<CategoryDto> {
        val categories = categoryRepository.findByUserIdIsNullAndIsActiveTrue()
        return categories.map { it.toDto() }
    }
    
    private fun buildCategoryTree(categories: List<Category>): List<CategoryDto> {
        val categoryMap = categories.associateBy { it.id }
        val rootCategories = mutableListOf<CategoryDto>()
        
        categories.forEach { category ->
            if (category.parent == null) {
                val dto = category.toDto()
                dto.subCategories = findSubCategories(category.id, categoryMap)
                rootCategories.add(dto)
            }
        }
        
        return rootCategories
    }
    
    private fun findSubCategories(parentId: Long, categoryMap: Map<Long, Category>): List<CategoryDto> {
        return categoryMap.values
            .filter { it.parent?.id == parentId }
            .map { category ->
                val dto = category.toDto()
                dto.subCategories = findSubCategories(category.id, categoryMap)
                dto
            }
    }
    
    private fun Category.toDto() = CategoryDto(
        id = id,
        name = name,
        type = type,
        icon = icon,
        color = color,
        isSystem = isSystem,
        isActive = isActive,
        parentId = parent?.id
    )
}
