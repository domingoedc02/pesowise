# PesoWise Frontend - Phase 1: Authentication System

## Overview
This is the React frontend for PesoWise, featuring a beautiful neumorphism design system built with Material UI. Phase 1 implements a complete authentication flow with JWT token management.

## Phase 1 Features Implemented

### Authentication UI
- ✅ Login page with username/email and password
- ✅ Registration flow (email → OTP verification → profile completion)
- ✅ Forgot password and reset password pages
- ✅ Protected routes with automatic redirects
- ✅ JWT token management with refresh tokens
- ✅ Form validation and error handling

### Design System
- ✅ Neumorphism design with Material UI
- ✅ Light/Dark/System theme support
- ✅ Responsive layout for all devices
- ✅ Smooth animations and transitions
- ✅ Lucide icons throughout

## Project Structure
```
web-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   ├── CompleteProfile.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── common/
│   │   │   └── PrivateRoute.tsx
│   │   └── Dashboard.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── styles/
│   │   └── theme.ts
│   ├── types/
│   │   └── auth.ts
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

## Technologies Used
- React 18 with TypeScript
- Material UI v5
- React Router v6
- Axios for API calls
- Lucide React for icons
- Date-fns for date handling
- Emotion for styling

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend server running on http://localhost:8080

### Installation
```bash
# Install dependencies
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

### Running the Application
```bash
# Start development server
npm start
```

The app will open at http://localhost:3000

## Authentication Flow

1. **Registration**
   - User enters email
   - Receives OTP via email
   - Verifies OTP
   - Completes profile (username, password, personal details)
   - Automatically logged in

2. **Login**
   - User enters username/email and password
   - Receives JWT tokens
   - Redirected to dashboard

3. **Password Reset**
   - User enters email
   - Receives reset link via email
   - Clicks link to reset password page
   - Sets new password
   - Redirected to login

## Key Features

### JWT Token Management
- Access tokens stored in localStorage
- Automatic token refresh on 401 responses
- Tokens cleared on logout

### Protected Routes
- Automatic redirect to login for unauthenticated users
- Redirect to profile completion if not complete
- Remember intended destination after login

### Form Validation
- Real-time username availability checking
- Email format validation
- Password strength requirements
- Comprehensive error messages

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and desktops
- Touch-friendly UI elements

## Development Notes

### State Management
- React Context for authentication state
- React Context for theme management
- Local component state for forms

### API Integration
- Centralized API service with interceptors
- Automatic token injection
- Error handling and retry logic

### Type Safety
- Full TypeScript coverage
- Strict type checking
- Interface definitions for all API responses

## Next Steps (Phase 2)
- User profile management
- Settings page
- Dashboard with financial tracking
- Transaction management
- Category management
- Reports and analytics

## Scripts
```bash
# Development
npm start

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers
