export interface User {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  settings?: UserSettings;
}

export interface UserSettings {
  currencyCode: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
  notificationsEnabled: boolean;
}

export interface RegisterRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface CompleteProfileRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string>;
  timestamp: number;
}
