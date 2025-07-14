package com.pesowise.server.exception

/**
 * Exception thrown when a requested resource is not found
 */
class ResourceNotFoundException(message: String) : RuntimeException(message)

/**
 * Exception thrown when a request is invalid or malformed
 */
class BadRequestException(message: String) : RuntimeException(message)

/**
 * Exception thrown when a user is not authorized to perform an action
 */
class UnauthorizedException(message: String) : RuntimeException(message)
