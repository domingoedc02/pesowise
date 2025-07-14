package com.pesowise.server.security

import com.pesowise.server.domain.repository.UserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {
    
    @Transactional(readOnly = true)
    override fun loadUserByUsername(username: String): UserDetails {
        // Check if username is an email or actual username
        val user = if (username.contains("@")) {
            userRepository.findActiveUserByEmail(username)
        } else {
            userRepository.findActiveUserByUsername(username)
        }.orElseThrow {
            UsernameNotFoundException("User not found with username: $username")
        }
        
        return CustomUserDetails(user)
    }
    
    @Transactional(readOnly = true)
    fun loadUserById(userId: Long): UserDetails {
        val user = userRepository.findById(userId)
            .orElseThrow {
                UsernameNotFoundException("User not found with id: $userId")
            }
        
        return CustomUserDetails(user)
    }
}
