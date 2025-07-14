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
  CircularProgress,
} from '@mui/material';
import { Mail, Wallet } from 'lucide-react';
import apiService from '../../services/api';
import { RegisterRequest } from '../../types/auth';
import { AxiosError } from 'axios';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
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
      await apiService.register(formData);
      setSuccess(true);
      // Store email for next step
      sessionStorage.setItem('registrationEmail', formData.email);
      // Navigate to OTP verification after 2 seconds
      setTimeout(() => {
        navigate('/register/verify-email');
      }, 2000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Failed to register. Please try again.');
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
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start your journey to financial freedom
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Verification code sent to your email! Redirecting...
            </Alert>
          )}

          <TextField
            fullWidth
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} />
                </InputAdornment>
              ),
            }}
            disabled={loading || success}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || success}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Continue'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              to="/login"
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
                Sign In
              </Typography>
            </Link>
          </Typography>
        </form>
      </Card>
    </Box>
  );
};

export default Register;
