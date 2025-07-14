package com.pesowise.server.service

import com.pesowise.server.domain.entity.*
import com.pesowise.server.domain.repository.TransactionRepository
import com.pesowise.server.domain.repository.AccountRepository
import com.pesowise.server.domain.repository.CategoryRepository
import com.pesowise.server.dto.CreateTransactionRequest
import com.pesowise.server.dto.UpdateTransactionRequest
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

class TransactionServiceTest {

    private lateinit var transactionRepository: TransactionRepository
    private lateinit var accountRepository: AccountRepository
    private lateinit var categoryRepository: CategoryRepository
    private lateinit var transactionService: TransactionService

    private lateinit var testUser: User
    private lateinit var testAccount: Account
    private lateinit var testCategory: Category
    private lateinit var testTransaction: Transaction

    @BeforeEach
    fun setUp() {
        transactionRepository = mockk()
        accountRepository = mockk()
        categoryRepository = mockk()
        transactionService = TransactionService(
            transactionRepository,
            accountRepository,
            categoryRepository
        )

        testUser = User(
            id = 1L,
            email = "test@example.com",
            password = "hashedpassword",
            firstName = "John",
            lastName = "Doe",
            isEmailVerified = true,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        testAccount = Account(
            id = 1L,
            name = "Test Account",
            type = AccountType.CHECKING,
            balance = BigDecimal("1000.00"),
            currency = "PHP",
            isActive = true,
            user = testUser,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        testCategory = Category(
            id = 1L,
            name = "Test Category",
            type = TransactionType.EXPENSE,
            icon = "test-icon",
            color = "#000000",
            isSystem = false,
            user = testUser,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        testTransaction = Transaction(
            id = 1L,
            amount = BigDecimal("100.00"),
            description = "Test Transaction",
            transactionDate = LocalDateTime.now(),
            type = TransactionType.EXPENSE,
            account = testAccount,
            category = testCategory,
            user = testUser,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }

    @Test
    fun `should create transaction successfully`() {
        // Given
        val request = CreateTransactionRequest(
            amount = BigDecimal("100.00"),
            description = "Test Transaction",
            transactionDate = LocalDateTime.now(),
            type = TransactionType.EXPENSE,
            accountId = 1L,
            categoryId = 1L
        )

        every { accountRepository.findByIdAndUserId(1L, 1L) } returns testAccount
        every { categoryRepository.findByIdAndUserId(1L, 1L) } returns testCategory
        every { transactionRepository.save(any<Transaction>()) } returns testTransaction

        // When
        val result = transactionService.createTransaction(request, 1L)

        // Then
        assertNotNull(result)
        assertEquals(testTransaction.id, result.id)
        assertEquals(testTransaction.amount, result.amount)
        verify { transactionRepository.save(any<Transaction>()) }
    }

    @Test
    fun `should throw exception when account not found`() {
        // Given
        val request = CreateTransactionRequest(
            amount = BigDecimal("100.00"),
            description = "Test Transaction",
            transactionDate = LocalDateTime.now(),
            type = TransactionType.EXPENSE,
            accountId = 999L,
            categoryId = 1L
        )

        every { accountRepository.findByIdAndUserId(999L, 1L) } returns null

        // When & Then
        assertThrows<IllegalArgumentException> {
            transactionService.createTransaction(request, 1L)
        }
    }

    @Test
    fun `should get transactions by user with pagination`() {
        // Given
        val pageable: Pageable = PageRequest.of(0, 10)
        val transactions = listOf(testTransaction)
        val page = PageImpl(transactions, pageable, 1)

        every { transactionRepository.findByUserIdOrderByTransactionDateDesc(1L, pageable) } returns page

        // When
        val result = transactionService.getTransactionsByUser(1L, pageable)

        // Then
        assertEquals(1, result.content.size)
        assertEquals(testTransaction.id, result.content[0].id)
    }

    @Test
    fun `should update transaction successfully`() {
        // Given
        val request = UpdateTransactionRequest(
            amount = BigDecimal("150.00"),
            description = "Updated Transaction"
        )

        every { transactionRepository.findByIdAndUserId(1L, 1L) } returns testTransaction
        every { transactionRepository.save(any<Transaction>()) } returns testTransaction.copy(
            amount = request.amount!!,
            description = request.description!!
        )

        // When
        val result = transactionService.updateTransaction(1L, request, 1L)

        // Then
        assertEquals(request.amount, result.amount)
        assertEquals(request.description, result.description)
    }

    @Test
    fun `should delete transaction successfully`() {
        // Given
        every { transactionRepository.findByIdAndUserId(1L, 1L) } returns testTransaction
        every { transactionRepository.delete(testTransaction) } returns Unit

        // When
        transactionService.deleteTransaction(1L, 1L)

        // Then
        verify { transactionRepository.delete(testTransaction) }
    }

    @Test
    fun `should throw exception when deleting non-existent transaction`() {
        // Given
        every { transactionRepository.findByIdAndUserId(999L, 1L) } returns null

        // When & Then
        assertThrows<IllegalArgumentException> {
            transactionService.deleteTransaction(999L, 1L)
        }
    }
}
