package com.pesowise.server.security

import com.pesowise.server.domain.entity.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

class CustomUserDetails(
    private val user: User
) : UserDetails {
    
    override fun getAuthorities(): Collection<GrantedAuthority> {
        // For now, we'll just return a default USER role
        // Later, you can expand this to include different roles
        return listOf(SimpleGrantedAuthority("ROLE_USER"))
    }
    
    override fun getPassword(): String {
        return user.password ?: ""
    }
    
    override fun getUsername(): String {
        // We'll use email as the username for authentication
        return user.email
    }
    
    override fun isAccountNonExpired(): Boolean {
        return user.isActive
    }
    
    override fun isAccountNonLocked(): Boolean {
        return user.isActive
    }
    
    override fun isCredentialsNonExpired(): Boolean {
        return user.isActive
    }
    
    override fun isEnabled(): Boolean {
        return user.isActive && user.isEmailVerified
    }
    
    fun getId(): String {
        return user.id
    }
    
    fun getUser(): User {
        return user
    }
}
