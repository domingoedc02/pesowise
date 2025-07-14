import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { LoginRequest } from '../../types/auth';
import { AxiosError } from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(formData);
      login(response.user);
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: (theme) => theme.enterprise.shadows.medium,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            <Wallet size={40} color="white" />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage your finances
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            name="usernameOrEmail"
            placeholder="Username or Email"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} />
                </InputAdornment>
              ),
            }}
            disabled={loading}
            required
          />

          <TextField
            fullWidth
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            disabled={loading}
            required
          />

          <Box sx={{ mb: 3, textAlign: 'right' }}>
            <Link
              to="/forgot-password"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              <Typography
                variant="body2"
                color="primary"
                sx={{ '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot Password?
              </Typography>
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <Typography
                component="span"
                color="primary"
                sx={{ '&:hover': { textDecoration: 'underline' } }}
              >
                Sign Up
              </Typography>
            </Link>
          </Typography>
        </form>
      </Card>
    </Box>
  );
};

export default Login;
