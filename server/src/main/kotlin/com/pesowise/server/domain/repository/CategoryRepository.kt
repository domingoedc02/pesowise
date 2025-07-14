package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.Category
import com.pesowise.server.domain.entity.TransactionType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CategoryRepository : JpaRepository<Category, Long> {
    fun findByUserIdAndIsActiveTrue(userId: String): List<Category>
    
    fun findByUserIdIsNullAndIsActiveTrue(): List<Category>
    
    fun findByUserIdAndId(userId: String, id: Long): Category?
    
    fun findByUserIdAndTypeAndIsActiveTrue(userId: String, type: TransactionType): List<Category>
    
    @Query("SELECT c FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) AND c.isActive = true ORDER BY c.isSystem DESC, c.name ASC")
    fun findAllAvailableForUser(userId: String): List<Category>
    
    @Query("SELECT c FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) AND c.type = :type AND c.isActive = true ORDER BY c.isSystem DESC, c.name ASC")
    fun findAllAvailableForUserByType(userId: String, type: TransactionType): List<Category>
    
    fun existsByNameAndUserId(name: String, userId: String): Boolean
}
