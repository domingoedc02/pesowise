package com.pesowise.server.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "categories")
data class Category(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: User? = null,

    @Column(nullable = false, length = 100)
    var name: String,

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var type: TransactionType,

    @Column(length = 50)
    var icon: String? = null,

    @Column(length = 7)
    var color: String? = null,

    @Column(name = "is_system", nullable = false)
    var isSystem: Boolean = false,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    var parent: Category? = null,

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    val subCategories: List<Category> = mutableListOf(),

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

enum class TransactionType {
    INCOME,
    EXPENSE,
    TRANSFER
}
