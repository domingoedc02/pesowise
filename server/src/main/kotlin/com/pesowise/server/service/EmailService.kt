package com.pesowise.server.service

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import org.thymeleaf.TemplateEngine
import org.thymeleaf.context.Context

@Service
class EmailService(
    private val mailSender: JavaMailSender,
    private val templateEngine: TemplateEngine
) {
    
    fun sendOtpEmail(email: String, otpCode: String) {
        val subject = "PesoWise - Email Verification"
        val message = """
            Welcome to PesoWise!
            
            Your verification code is: $otpCode
            
            This code will expire in 10 minutes.
            
            If you didn't request this verification, please ignore this email.
            
            Best regards,
            PesoWise Team
        """.trimIndent()
        
        sendSimpleEmail(email, subject, message)
    }
    
    fun sendWelcomeEmail(email: String, firstName: String?) {
        val subject = "Welcome to PesoWise!"
        val name = firstName ?: "User"
        val message = """
            Hi $name,
            
            Welcome to PesoWise! Your account has been successfully created.
            
            Start tracking your finances today and take control of your financial future.
            
            If you have any questions, feel free to reach out to our support team.
            
            Best regards,
            PesoWise Team
        """.trimIndent()
        
        sendSimpleEmail(email, subject, message)
    }
    
    fun sendPasswordResetEmail(email: String, resetLink: String) {
        val subject = "PesoWise - Password Reset Request"
        val message = """
            Hi,
            
            We received a request to reset your password for your PesoWise account.
            
            Click the link below to reset your password:
            $resetLink
            
            This link will expire in 1 hour.
            
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            
            Best regards,
            PesoWise Team
        """.trimIndent()
        
        sendSimpleEmail(email, subject, message)
    }
    
    private fun sendSimpleEmail(to: String, subject: String, text: String) {
        try {
            val message = SimpleMailMessage().apply {
                setTo(to)
                setSubject(subject)
                setText(text)
                setFrom("noreply@pesowise.com")
            }
            mailSender.send(message)
        } catch (e: Exception) {
            // Log the error but don't throw exception to prevent breaking the flow
            println("Failed to send email to $to: ${e.message}")
        }
    }
    
    fun sendHtmlEmail(to: String, subject: String, templateName: String, variables: Map<String, Any>) {
        try {
            val context = Context().apply {
                setVariables(variables)
            }
            val htmlContent = templateEngine.process(templateName, context)
            
            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true, "UTF-8")
            
            helper.setTo(to)
            helper.setSubject(subject)
            helper.setText(htmlContent, true)
            helper.setFrom("noreply@pesowise.com")
            
            mailSender.send(message)
        } catch (e: Exception) {
            // Log the error but don't throw exception to prevent breaking the flow
            println("Failed to send HTML email to $to: ${e.message}")
        }
    }
}
