package com.pesowise.server.security

import com.pesowise.server.config.JwtProperties
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.security.Key
import java.util.*

@Service
class JwtService(
    private val jwtProperties: JwtProperties
) {
    
    fun extractUsername(token: String): String {
        return extractClaim(token, Claims::getSubject)
    }
    
    fun <T> extractClaim(token: String, claimsResolver: (Claims) -> T): T {
        val claims = extractAllClaims(token)
        return claimsResolver(claims)
    }
    
    fun generateToken(userDetails: UserDetails): String {
        return generateToken(emptyMap(), userDetails)
    }
    
    fun generateToken(extraClaims: Map<String, Any>, userDetails: UserDetails): String {
        return buildToken(extraClaims, userDetails, jwtProperties.expiration)
    }
    
    fun generateRefreshToken(userDetails: UserDetails): String {
        return buildToken(emptyMap(), userDetails, jwtProperties.refresh.expiration)
    }
    
    private fun buildToken(
        extraClaims: Map<String, Any>,
        userDetails: UserDetails,
        expiration: Long
    ): String {
        return Jwts
            .builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.username)
            .setIssuedAt(Date(System.currentTimeMillis()))
            .setExpiration(Date(System.currentTimeMillis() + expiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact()
    }
    
    fun isTokenValid(token: String, userDetails: UserDetails): Boolean {
        val username = extractUsername(token)
        return (username == userDetails.username) && !isTokenExpired(token)
    }
    
    private fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }
    
    private fun extractExpiration(token: String): Date {
        return extractClaim(token, Claims::getExpiration)
    }
    
    private fun extractAllClaims(token: String): Claims {
        return Jwts
            .parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token)
            .body
    }
    
    private fun getSignInKey(): Key {
        val keyBytes = Decoders.BASE64.decode(jwtProperties.secret)
        return Keys.hmacShaKeyFor(keyBytes)
    }
}
