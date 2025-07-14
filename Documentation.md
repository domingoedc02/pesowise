# PesoWise - Financial Tracker Web Application Development Prompt

## Project Overview
Create a comprehensive financial tracking web application called **PesoWise** with a modern neumorphism design, supporting both web frontend and Spring Boot backend. The application should help users manage their finances with advanced features including receipt scanning, budget tracking, and financial analytics.

## Project Structure
```
pesowise-full-code/   # Current File
├── web-app/          # React frontend
└── server/           # Spring Boot backend
```

## Technology Stack

### Frontend (web-app)
- **React** with TypeScript
- **Material UI** for components
- **Lucide Icons** for iconography
- Modern neumorphism design system
- Dark/Light/System theme support

### Backend (server)
- **Spring Boot** with Kotlin
- **Gradle Kotlin DSL** for build configuration
- **JWT** for authentication
- **PostgreSQL** database
- **Flyway** for database migrations
- **Java Mail Service** for email verification
- **OCR/Image Processing** for receipt scanning
- **RESTful APIs**

## Core Features & Requirements

### Authentication System
- **Registration Flow:**
  1. Email input only
  2. Email verification with OTP code
  3. Complete profile setup (name, username, DOB, gender, password)
- **Login/Logout** with JWT tokens
- **Password reset** functionality

### User Management
- **User Profile** management
- **Settings** panel with currency selection
- **Multi-currency support**

### Financial Features
- **Dashboard** with overview metrics
- **Analytics** with charts and insights
- **Digital Wallet** management
- **Financial Goals** tracking
- **Budget Management** with categories/subcategories
- **Transaction Management** (income/expense)
- **Net Worth** calculation and tracking

### Smart Receipt Processing
- **Floating Action Button** with options:
  - Add manual transaction
  - Add manual income
  - Upload image/PDF receipt
  - Take photo of receipt
- **OCR Integration** to extract:
  - Merchant name
  - Amount/cost
  - Reference number
  - Date and other details
- **Receipt Verification** flow for user confirmation/editing
- **Receipt Storage** with transaction linking

### UI/UX Requirements
- **Modern Neumorphism** design language
- **Responsive design** for all screen sizes
- **Theme system**: Dark/Light/System modes
- **Intuitive navigation** and user flows
- **Loading states** and error handling

---

## Development Phases

### Phase 1: Project Setup & Authentication
**Duration: 1-2 weeks**

#### Backend Tasks:
- [ ] Initialize Spring Boot project with Kotlin and Gradle
- [ ] Configure PostgreSQL database connection
- [ ] Set up Flyway migrations for user tables
- [ ] Implement JWT authentication service
- [ ] Create User entity and repository
- [ ] Implement email service with OTP generation
- [ ] Build registration API endpoints (email → OTP → profile completion)
- [ ] Build login/logout API endpoints
- [ ] Add password reset functionality
- [ ] Implement CORS configuration for frontend

#### Frontend Tasks:
- [ ] Initialize React project with TypeScript
- [ ] Set up Material UI and theme configuration
- [ ] Implement neumorphism design system
- [ ] Create routing structure with React Router
- [ ] Build authentication pages (Login, Register steps, OTP verification)
- [ ] Implement JWT token management
- [ ] Create protected route components
- [ ] Add form validation and error handling
- [ ] Set up API client with Axios/Fetch

#### Deliverables:
- Fully functional authentication system
- User registration with email verification
- Login/logout with JWT tokens
- Basic routing and navigation

### Phase 2: Core UI Framework & User Management
**Duration: 1-2 weeks**

#### Backend Tasks:
- [ ] Create user profile management APIs
- [ ] Implement settings management (currency, preferences)
- [ ] Add user profile image upload
- [ ] Create currency management system
- [ ] Implement user data validation
- [ ] Add audit logging for user actions

#### Frontend Tasks:
- [ ] Design and implement main layout with navigation
- [ ] Create dashboard skeleton/layout
- [ ] Build user profile management pages
- [ ] Implement settings panel with currency selector
- [ ] Add theme switcher (Dark/Light/System)
- [ ] Create reusable neumorphism components
- [ ] Implement responsive design patterns
- [ ] Add loading states and skeleton screens

#### Deliverables:
- Complete UI framework with neumorphism design
- User profile and settings management
- Theme system implementation
- Responsive layout structure

### Phase 3: Financial Data Models & Basic Features
**Duration: 2-3 weeks**

#### Backend Tasks:
- [ ] Design and create financial database schema
- [ ] Implement Category and Subcategory entities
- [ ] Create Transaction entity with proper relationships
- [ ] Build Wallet/Account management system
- [ ] Implement Budget entity and logic
- [ ] Create Goals tracking system
- [ ] Add Net Worth calculation services
- [ ] Build comprehensive API endpoints for all entities
- [ ] Implement data validation and business rules

#### Frontend Tasks:
- [ ] Create transaction management interface
- [ ] Build category/subcategory management
- [ ] Implement wallet/account views
- [ ] Design and build budget creation/editing
- [ ] Create goals tracking interface
- [ ] Add net worth display components
- [ ] Implement data tables with sorting/filtering
- [ ] Create form components for financial data entry

#### Deliverables:
- Complete financial data management system
- Transaction, budget, and goal tracking
- Wallet and net worth features
- CRUD operations for all financial entities

### Phase 4: Analytics & Dashboard
**Duration: 2-3 weeks**

#### Backend Tasks:
- [ ] Implement analytics calculation services
- [ ] Create dashboard data aggregation APIs
- [ ] Build financial reporting endpoints
- [ ] Add data export functionality
- [ ] Implement caching for performance
- [ ] Create scheduled tasks for data processing
- [ ] Add financial insights algorithms

#### Frontend Tasks:
- [ ] Integrate charting library (Chart.js or Recharts)
- [ ] Build comprehensive dashboard with widgets
- [ ] Create analytics page with multiple chart types
- [ ] Implement financial insights display
- [ ] Add interactive chart features
- [ ] Create report generation interface
- [ ] Implement data visualization best practices
- [ ] Add dashboard customization options

#### Deliverables:
- Interactive dashboard with key metrics
- Comprehensive analytics with charts
- Financial insights and reporting
- Data visualization system

### Phase 5: Smart Receipt Processing
**Duration: 3-4 weeks**

#### Backend Tasks:
- [ ] Integrate OCR service (Tesseract or cloud service)
- [ ] Implement image/PDF processing pipeline
- [ ] Create receipt parsing algorithms
- [ ] Build merchant recognition system
- [ ] Implement receipt data extraction APIs
- [ ] Add image storage and management
- [ ] Create receipt verification workflows
- [ ] Add receipt-transaction linking

#### Frontend Tasks:
- [ ] Implement floating action button with menu
- [ ] Create image/PDF upload interface
- [ ] Build camera integration for photo capture
- [ ] Design receipt preview and editing interface
- [ ] Implement receipt verification flow
- [ ] Add image cropping and enhancement tools
- [ ] Create receipt gallery/history view
- [ ] Add manual transaction creation with receipt linking

#### Deliverables:
- Smart receipt scanning and processing
- OCR integration with data extraction
- Receipt verification and editing system
- Image management and storage

### Phase 6: Advanced Features & Optimization
**Duration: 2-3 weeks**

#### Backend Tasks:
- [ ] Implement advanced search and filtering
- [ ] Add data backup and restore features
- [ ] Create API rate limiting and security enhancements
- [ ] Implement audit trails and logging
- [ ] Add performance monitoring
- [ ] Create admin/management tools
- [ ] Implement data archiving strategies

#### Frontend Tasks:
- [ ] Add advanced search and filtering UI
- [ ] Implement data export/import features
- [ ] Create user onboarding and tutorials
- [ ] Add accessibility improvements
- [ ] Implement progressive web app features
- [ ] Create keyboard shortcuts and power-user features
- [ ] Add print-friendly views
- [ ] Implement offline capabilities

#### Deliverables:
- Advanced search and filtering
- Data backup/restore functionality
- Enhanced user experience features
- Performance optimizations

### Phase 7: Testing, Deployment & Polish
**Duration: 2-3 weeks**

#### Backend Tasks:
- [ ] Comprehensive unit and integration testing
- [ ] API documentation with OpenAPI/Swagger
- [ ] Security audit and penetration testing
- [ ] Performance testing and optimization
- [ ] Production deployment configuration
- [ ] Monitoring and logging setup
- [ ] Database optimization and indexing

#### Frontend Tasks:
- [ ] Unit testing with Jest and React Testing Library
- [ ] E2E testing with Cypress or Playwright
- [ ] Cross-browser compatibility testing
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Production build optimization
- [ ] SEO and meta tag optimization
- [ ] Final UI polish and bug fixes

#### Deliverables:
- Fully tested and production-ready application
- Comprehensive documentation
- Deployment configuration
- Performance monitoring setup

---

## Success Criteria

### Technical Requirements
- [ ] Secure authentication with JWT
- [ ] Responsive design across all devices
- [ ] Sub-2 second page load times
- [ ] 95%+ uptime in production
- [ ] Proper error handling and user feedback
- [ ] Accessible design (WCAG compliance)

### Business Requirements
- [ ] Complete user onboarding flow
- [ ] Intuitive financial data management
- [ ] Accurate receipt processing (85%+ accuracy)
- [ ] Comprehensive analytics and insights
- [ ] Multi-currency support
- [ ] Data export capabilities

### User Experience
- [ ] Modern, appealing neumorphism design
- [ ] Intuitive navigation and workflows
- [ ] Fast, responsive interactions
- [ ] Clear visual hierarchy and typography
- [ ] Consistent theme implementation
- [ ] Mobile-first responsive design

This phased approach ensures systematic development while maintaining focus on delivering a high-quality, feature-rich financial tracking application.