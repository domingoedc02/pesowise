package com.pesowise.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import com.pesowise.server.config.JwtProperties

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties::class)
class ServerApplication

fun main(args: Array<String>) {
	runApplication<ServerApplication>(*args)
}
