package com.pesowise.server.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.nio.file.Paths

@Configuration
class WebConfig : WebMvcConfigurer {
    
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // Serve uploaded files
        val uploadPath = Paths.get("uploads").toAbsolutePath().toString()
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:$uploadPath/")
    }
}
