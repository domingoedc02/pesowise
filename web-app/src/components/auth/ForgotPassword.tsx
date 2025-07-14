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
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import apiService from '../../services/api';
import { ForgotPasswordRequest } from '../../types/auth';
import { AxiosError } from 'axios';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordRequest>({
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
      await apiService.forgotPassword(formData);
      setSuccess(true);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                background: (theme) => `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              }}
            >
              <Mail size={40} color="white" />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Check Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a password reset link to {formData.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the email? Check your spam folder or try again.
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
            size="large"
          >
            Back to Login
          </Button>
        </Card>
      </Box>
    );
  }

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
            <KeyRound size={40} color="white" />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email and we'll send you a reset link
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
            disabled={loading}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>

          <Link
            to="/login"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft size={20} />
            <Typography
              variant="body2"
              color="primary"
              sx={{ '&:hover': { textDecoration: 'underline' } }}
            >
              Back to Login
            </Typography>
          </Link>
        </form>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
