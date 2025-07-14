package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "accounts")
data class Account(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false, length = 100)
    var name: String,

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    var type: AccountType,

    @Column(nullable = false, length = 3)
    var currency: String = "PHP",

    @Column(nullable = false, precision = 15, scale = 2)
    var balance: BigDecimal = BigDecimal.ZERO,

    @Column(name = "initial_balance", nullable = false, precision = 15, scale = 2)
    var initialBalance: BigDecimal = BigDecimal.ZERO,

    @Column(length = 50)
    var icon: String? = null,

    @Column(length = 7)
    var color: String? = null,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "is_included_in_total", nullable = false)
    var isIncludedInTotal: Boolean = true,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

enum class AccountType {
    BANK,
    CASH,
    CREDIT_CARD,
    E_WALLET,
    INVESTMENT
}
