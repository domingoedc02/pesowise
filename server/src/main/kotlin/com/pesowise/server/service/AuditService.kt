package com.pesowise.server.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuditService {
    private val logger = LoggerFactory.getLogger(javaClass)
    
    fun logUserAction(userId: String, action: String, details: String? = null) {
        val message = buildString {
            append("USER_ACTION | ")
            append("userId=$userId | ")
            append("action=$action")
            details?.let { append(" | details=$it") }
        }
        logger.info(message)
    }
    
    fun logAuthenticationEvent(email: String, event: String, success: Boolean, details: String? = null) {
        val message = buildString {
            append("AUTH_EVENT | ")
            append("email=$email | ")
            append("event=$event | ")
            append("success=$success")
            details?.let { append(" | details=$it") }
        }
        
        if (success) {
            logger.info(message)
        } else {
            logger.warn(message)
        }
    }
    
    fun logDataAccess(userId: UUID, resource: String, action: String) {
        val message = buildString {
            append("DATA_ACCESS | ")
            append("userId=$userId | ")
            append("resource=$resource | ")
            append("action=$action")
        }
        logger.info(message)
    }
    
    fun logSecurityEvent(event: String, details: String) {
        val message = buildString {
            append("SECURITY_EVENT | ")
            append("event=$event | ")
            append("details=$details")
        }
        logger.warn(message)
    }
}
