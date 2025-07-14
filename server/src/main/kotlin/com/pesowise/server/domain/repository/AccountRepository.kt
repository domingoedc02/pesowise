package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface AccountRepository : JpaRepository<Account, Long> {
    fun findByUserIdAndIsActiveTrue(userId: String): List<Account>
    
    fun findByUserIdAndId(userId: String, id: Long): Account?
    
    @Query("SELECT SUM(a.balance) FROM Account a WHERE a.user.id = :userId AND a.isActive = true AND a.isIncludedInTotal = true")
    fun getTotalBalance(userId: String): BigDecimal?
    
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.type = :type AND a.isActive = true")
    fun findByUserIdAndType(userId: String, type: String): List<Account>
    
    fun countByUserIdAndIsActiveTrue(userId: String): Long
}
