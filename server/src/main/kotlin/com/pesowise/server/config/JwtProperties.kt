package com.pesowise.server.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "jwt")
data class JwtProperties(
    var secret: String = "",
    var expiration: Long = 86400000, // 1 day in milliseconds
    var refresh: RefreshToken = RefreshToken()
) {
    data class RefreshToken(
        var expiration: Long = 604800000 // 7 days in milliseconds
    )
}
