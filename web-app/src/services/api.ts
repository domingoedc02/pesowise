import axios, { AxiosError, AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  ErrorResponse, 
  LoginRequest, 
  RegisterRequest, 
  VerifyOtpRequest, 
  CompleteProfileRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  MessageResponse
} from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;
  private refreshingToken: Promise<AuthResponse> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            if (!this.refreshingToken) {
              this.refreshingToken = this.refreshToken();
            }
            
            const response = await this.refreshingToken;
            this.refreshingToken = null;
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.refreshingToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<MessageResponse> {
    const response = await this.api.post<MessageResponse>('/auth/register', data);
    return response.data;
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<MessageResponse> {
    const response = await this.api.post<MessageResponse>('/auth/verify-otp', data);
    return response.data;
  }

  async completeProfile(data: CompleteProfileRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/complete-profile', data);
    this.storeAuthData(response.data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    this.storeAuthData(response.data);
    return response.data;
  }

  async logout(): Promise<MessageResponse> {
    try {
      const response = await this.api.post<MessageResponse>('/auth/logout');
      return response.data;
    } finally {
      this.clearAuthData();
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    const response = await this.api.post<MessageResponse>('/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    const response = await this.api.post<MessageResponse>('/auth/reset-password', data);
    return response.data;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const response = await this.api.get<{ exists: boolean }>(`/auth/check-email/${email}`);
    return response.data.exists;
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const response = await this.api.get<{ exists: boolean }>(`/auth/check-username/${username}`);
    return response.data.exists;
  }

  private async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<AuthResponse>('/auth/refresh-token', {
      refreshToken,
    } as RefreshTokenRequest);

    return response.data;
  }

  private storeAuthData(data: AuthResponse): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // User endpoints
  async get(url: string) {
    const response = await this.api.get(url);
    return response;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.api.post(url, data, config);
    return response;
  }

  async put(url: string, data?: any) {
    const response = await this.api.put(url, data);
    return response;
  }

  async delete(url: string) {
    const response = await this.api.delete(url);
    return response;
  }
}

export default new ApiService();

// Financial API endpoints
const api = new ApiService();

// User profile endpoints
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  updateSettings: (data: any) => api.put('/user/settings', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/user/password', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Account endpoints
export const accountApi = {
  getAll: () => api.get('/accounts'),
  getById: (id: number) => api.get(`/accounts/${id}`),
  create: (data: any) => api.post('/accounts', data),
  update: (id: number, data: any) => api.put(`/accounts/${id}`, data),
  delete: (id: number) => api.delete(`/accounts/${id}`),
  getTotalBalance: () => api.get('/accounts/total-balance'),
  getBalances: () => api.get('/accounts/balances'),
};

// Category endpoints
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getByType: (type: string) => api.get(`/categories/type/${type}`),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
  getSystem: () => api.get('/categories/system'),
};

// Transaction endpoints
export const transactionApi = {
  getAll: (page = 0, size = 20) => api.get(`/transactions?page=${page}&size=${size}`),
  getByAccount: (accountId: number, page = 0, size = 20) => 
    api.get(`/transactions/account/${accountId}?page=${page}&size=${size}`),
  getByCategory: (categoryId: number, page = 0, size = 20) => 
    api.get(`/transactions/category/${categoryId}?page=${page}&size=${size}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get(`/transactions/date-range?startDate=${startDate}&endDate=${endDate}`),
  search: (search: string, page = 0, size = 20) => 
    api.get(`/transactions/search?search=${search}&page=${page}&size=${size}`),
  getById: (id: number) => api.get(`/transactions/${id}`),
  create: (data: any) => api.post('/transactions', data),
  update: (id: number, data: any) => api.put(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
  getMonthlyIncome: (month: string) => api.get(`/transactions/monthly-income?month=${month}`),
  getMonthlyExpenses: (month: string) => api.get(`/transactions/monthly-expenses?month=${month}`),
  getCategoryBreakdown: (type: string, startDate: string, endDate: string) => 
    api.get(`/transactions/category-breakdown?type=${type}&startDate=${startDate}&endDate=${endDate}`),
};

// Budget endpoints
export const budgetApi = {
  getAll: () => api.get('/budgets'),
  getById: (id: number) => api.get(`/budgets/${id}`),
  create: (data: any) => api.post('/budgets', data),
  update: (id: number, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
  getProgress: (id: number) => api.get(`/budgets/${id}/progress`),
};

// Goal endpoints
export const goalApi = {
  getAll: () => api.get('/goals'),
  getActive: () => api.get('/goals/active'),
  getCompleted: () => api.get('/goals/completed'),
  getByCategory: (category: string) => api.get(`/goals/category/${category}`),
  getById: (id: number) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: number, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: number) => api.delete(`/goals/${id}`),
  contribute: (id: number, data: any) => api.post(`/goals/${id}/contribute`, data),
  getContributions: (id: number) => api.get(`/goals/${id}/contributions`),
  getProgress: (id: number) => api.get(`/goals/${id}/progress`),
  getSummary: () => api.get('/goals/summary'),
};

// Notification endpoints
export const notificationApi = {
  getAll: (page = 0, size = 20) => api.get(`/notifications?page=${page}&size=${size}`),
  getUnread: () => api.get('/notifications/unread'),
  getByType: (type: string, page = 0, size = 20) => 
    api.get(`/notifications/type/${type}?page=${page}&size=${size}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  cleanup: () => api.delete('/notifications/cleanup'),
};

// Dashboard endpoints
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getQuickStats: () => api.get('/dashboard/quick-stats'),
};

// Analytics endpoints
export const analyticsApi = {
  getSpendingAnalytics: (days?: number) => 
    api.get(`/analytics/spending${days ? `?days=${days}` : ''}`),
  getSpendingAnalyticsCustom: (startDate: string, endDate: string) =>
    api.get(`/analytics/spending/custom?startDate=${startDate}&endDate=${endDate}`),
  getMonthlyTrends: (months?: number) =>
    api.get(`/analytics/trends${months ? `?months=${months}` : ''}`),
  getBudgetAnalytics: () => api.get('/analytics/budgets'),
  getGoalAnalytics: () => api.get('/analytics/goals'),
  getAccountAnalytics: () => api.get('/analytics/accounts'),
  getFinancialInsights: () => api.get('/analytics/insights'),
  getAnalyticsSummary: () => api.get('/analytics/summary'),
};
