package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "goal_contributions")
data class GoalContribution(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    val goal: Goal,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    val account: Account,

    @Column(nullable = false, precision = 15, scale = 2)
    var amount: BigDecimal,

    @Column(name = "contribution_date", nullable = false)
    var contributionDate: LocalDate,

    @Column(columnDefinition = "TEXT")
    var notes: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
