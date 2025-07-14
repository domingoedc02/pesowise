package com.pesowise.server.domain.repository

import com.pesowise.server.domain.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
    
    fun findByUsername(username: String): Optional<User>
    
    fun existsByEmail(email: String): Boolean
    
    fun existsByUsername(username: String): Boolean
    
    @Query("SELECT u FROM User u WHERE u.email = ?1 AND u.isActive = true")
    fun findActiveUserByEmail(email: String): Optional<User>
    
    @Query("SELECT u FROM User u WHERE u.username = ?1 AND u.isActive = true")
    fun findActiveUserByUsername(username: String): Optional<User>
    
    @Query("SELECT u FROM User u WHERE (u.email = ?1 OR u.username = ?1) AND u.isActive = true")
    fun findActiveUserByEmailOrUsername(emailOrUsername: String): Optional<User>

    fun findById(id: String): Optional<User>
}
