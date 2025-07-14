# PesoWise Backend - Phase 1: Authentication System

## Overview
This is the Spring Boot backend for PesoWise, a comprehensive financial tracking web application. Phase 1 implements a complete authentication system with JWT tokens, email verification, and password reset functionality.

## Phase 1 Features Implemented

### Authentication System
- ✅ User registration with email-only initial signup
- ✅ Email verification with OTP codes
- ✅ Profile completion after email verification
- ✅ JWT-based authentication (access & refresh tokens)
- ✅ Login/logout functionality
- ✅ Password reset with email tokens
- ✅ Username and email availability checking

### Technical Implementation
- ✅ Spring Security with JWT authentication
- ✅ PostgreSQL database with Flyway migrations
- ✅ Email service for OTP and password reset
- ✅ Global exception handling
- ✅ CORS configuration for frontend integration
- ✅ Comprehensive validation

## Project Structure
```
server/
├── src/main/kotlin/com/pesowise/server/
│   ├── config/
│   │   ├── JwtProperties.kt
│   │   └── SecurityConfig.kt
│   ├── controller/
│   │   └── AuthController.kt
│   ├── domain/
│   │   ├── entity/
│   │   │   ├── User.kt
│   │   │   ├── UserSettings.kt
│   │   │   ├── EmailVerification.kt
│   │   │   └── PasswordResetToken.kt
│   │   └── repository/
│   │       ├── UserRepository.kt
│   │       ├── UserSettingsRepository.kt
│   │       ├── EmailVerificationRepository.kt
│   │       └── PasswordResetTokenRepository.kt
│   ├── dto/
│   │   └── AuthDto.kt
│   ├── exception/
│   │   └── GlobalExceptionHandler.kt
│   ├── security/
│   │   ├── CustomUserDetails.kt
│   │   ├── CustomUserDetailsService.kt
│   │   ├── JwtAuthenticationFilter.kt
│   │   └── JwtService.kt
│   ├── service/
│   │   ├── AuthService.kt
│   │   └── EmailService.kt
│   └── ServerApplication.kt
└── src/main/resources/
    ├── db/migration/
    │   └── V1__Create_user_tables.sql
    └── application.properties
```

## API Endpoints

### Authentication Endpoints (Public)
- `POST /api/auth/register` - Register with email
- `POST /api/auth/verify-otp` - Verify email with OTP code
- `POST /api/auth/complete-profile` - Complete profile setup
- `POST /api/auth/login` - Login with username/email and password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/logout` - Logout (client-side token removal)
- `GET /api/auth/check-email/{email}` - Check if email exists
- `GET /api/auth/check-username/{username}` - Check if username exists

## Database Setup

### Prerequisites
- PostgreSQL 12+ installed and running
- Database created: `pesowise_db`
- User created: `pesowise_user` with password `pesowise_password`

### Create Database
```sql
CREATE DATABASE pesowise_db;
CREATE USER pesowise_user WITH PASSWORD 'pesowise_password';
GRANT ALL PRIVILEGES ON DATABASE pesowise_db TO pesowise_user;
```

## Configuration

### Email Configuration
Update the email settings in `application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in the configuration

### JWT Configuration
The JWT secret is already configured but should be changed for production:
```properties
jwt.secret=your-production-secret-key
```

## Running the Application

### Prerequisites
- Java 17+
- PostgreSQL database running
- Email SMTP server configured

### Build and Run
```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The server will start on `http://localhost:8080`

## Testing the Authentication Flow

### 1. Register a new user
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### 2. Verify OTP (check email for code)
```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otpCode": "123456"}'
```

### 3. Complete Profile
```bash
curl -X POST http://localhost:8080/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "Male"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "johndoe", "password": "securePassword123"}'
```

## Next Steps (Phase 2)
- User profile management APIs
- Settings management
- Profile image upload
- Currency management system
- Audit logging

## Development Notes
- The application uses Flyway for database migrations
- All passwords are encrypted using BCrypt
- JWT tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Email verification codes expire after 10 minutes
- Password reset tokens expire after 1 hour
