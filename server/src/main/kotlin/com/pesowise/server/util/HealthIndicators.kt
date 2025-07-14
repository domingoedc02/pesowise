package com.pesowise.server.util

import org.springframework.boot.actuate.health.Health
import org.springframework.boot.actuate.health.HealthIndicator
import org.springframework.stereotype.Component
import javax.sql.DataSource
import java.sql.Connection

@Component
class DatabaseHealthIndicator(
    private val dataSource: DataSource
) : HealthIndicator {

    override fun health(): Health {
        return try {
            val connection: Connection = dataSource.connection
            connection.use {
                val isValid = it.isValid(10)
                if (isValid) {
                    Health.up()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("status", "UP")
                        .build()
                } else {
                    Health.down()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("status", "Connection invalid")
                        .build()
                }
            }
        } catch (e: Exception) {
            Health.down()
                .withDetail("database", "PostgreSQL")
                .withDetail("status", "DOWN")
                .withDetail("error", e.message)
                .build()
        }
    }
}

@Component
class ApplicationHealthIndicator : HealthIndicator {

    override fun health(): Health {
        val runtime = Runtime.getRuntime()
        val maxMemory = runtime.maxMemory()
        val totalMemory = runtime.totalMemory()
        val freeMemory = runtime.freeMemory()
        val usedMemory = totalMemory - freeMemory
        val memoryUsagePercentage = (usedMemory.toDouble() / maxMemory.toDouble()) * 100

        return if (memoryUsagePercentage < 90) {
            Health.up()
                .withDetail("application", "PesoWise Server")
                .withDetail("memory_usage_percentage", "%.2f%%".format(memoryUsagePercentage))
                .withDetail("max_memory_mb", maxMemory / 1024 / 1024)
                .withDetail("used_memory_mb", usedMemory / 1024 / 1024)
                .build()
        } else {
            Health.down()
                .withDetail("application", "PesoWise Server")
                .withDetail("memory_usage_percentage", "%.2f%%".format(memoryUsagePercentage))
                .withDetail("status", "High memory usage")
                .build()
        }
    }
}
