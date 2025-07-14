import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import CompleteProfile from './components/auth/CompleteProfile';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './components/Dashboard';
import { Profile } from './components/user/Profile';
import { AccountList } from './components/accounts/AccountList';
import { BudgetList } from './components/budgets/BudgetList';
import { CategoryList } from './components/categories/CategoryList';
import TransactionList from './components/transactions/TransactionList';
import GoalList from './components/goals/GoalList';
import { Settings } from './components/user/Settings';
import Analytics from './components/analytics/Analytics';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/verify-email" element={<VerifyEmail />} />
            <Route path="/register/complete-profile" element={<CompleteProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Private Routes with Layout */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="wallet" element={<AccountList />} />
              <Route path="transactions" element={<TransactionList />} />
              <Route path="goals" element={<GoalList />} />
              <Route path="settings" element={<Settings />} />
              <Route path="budgets" element={<BudgetList />} />
              <Route path="categories" element={<CategoryList />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
