# PesoWise - Financial Tracking Application

## Overview
PesoWise is a comprehensive financial tracking web application that helps users manage their personal finances. Built with a modern tech stack featuring Spring Boot (Kotlin) backend and React (TypeScript) frontend with a beautiful neumorphism design.

## Phase 1 Completed ✅

### Backend (Spring Boot with Kotlin)
- Complete authentication system with JWT tokens
- Email verification with OTP
- Password reset functionality
- PostgreSQL database with Flyway migrations
- Spring Security configuration
- RESTful API endpoints

### Frontend (React with TypeScript)
- Beautiful neumorphism UI design
- Complete authentication flow
- JWT token management
- Protected routes
- Light/Dark/System theme support
- Responsive design

## Tech Stack

### Backend
- Spring Boot 3.5.3
- Kotlin 1.9.25
- PostgreSQL
- Spring Security with JWT
- Spring Data JPA
- Flyway for migrations
- JavaMail for email

### Frontend
- React 18
- TypeScript
- Material UI v5
- React Router v6
- Axios
- Lucide React icons

## Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL 12+
- SMTP server (for emails)

### Database Setup
```sql
CREATE DATABASE pesowise_db;
CREATE USER pesowise_user WITH PASSWORD 'pesowise_password';
GRANT ALL PRIVILEGES ON DATABASE pesowise_db TO pesowise_user;
```

### Backend Setup
```bash
cd server

# Configure email in application.properties
# Update spring.mail.username and spring.mail.password

# Build and run
./gradlew bootRun
```

The backend will start on http://localhost:8080

### Frontend Setup
```bash
cd web-app

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on http://localhost:3000

## Features

### Phase 1 (Completed)
- User registration with email verification
- Login/logout functionality
- Password reset via email
- JWT-based authentication
- Protected routes
- User profile creation
- Neumorphism UI design
- Dark/Light theme support

### Phase 2 (Planned)
- Financial transaction management
- Category management
- Budget tracking
- Reports and analytics
- Data visualization
- Export functionality

### Phase 3 (Planned)
- Goal setting and tracking
- Recurring transactions
- Multi-currency support
- Mobile app
- Data import from banks

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register with email
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/complete-profile` - Complete profile
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/check-email/{email}` - Check email availability
- `GET /api/auth/check-username/{username}` - Check username availability

## Project Structure
```
pesowise-full-code/
├── server/                 # Spring Boot backend
│   ├── src/
│   ├── build.gradle.kts
│   └── README.md
├── web-app/               # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── Documentation.md       # Detailed project documentation
└── README.md             # This file
```

## Security Features
- BCrypt password hashing
- JWT tokens with expiration
- CORS configuration
- Input validation
- SQL injection protection
- XSS protection

## Contributing
This is a personal project, but suggestions and feedback are welcome!

## License
This project is private and not licensed for public use.

## Contact
For questions or suggestions, please contact the project maintainer.

---
Built with ❤️ using Spring Boot, Kotlin, React, and TypeScript
