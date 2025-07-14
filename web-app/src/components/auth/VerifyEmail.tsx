import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { ShieldCheck, Wallet } from 'lucide-react';
import apiService from '../../services/api';
import { VerifyOtpRequest } from '../../types/auth';
import { AxiosError } from 'axios';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('registrationEmail');
    if (!storedEmail) {
      navigate('/register');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtpCode(value);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    const data: VerifyOtpRequest = {
      email,
      otpCode,
    };

    try {
      await apiService.verifyOtp(data);
      setSuccess(true);
      // Navigate to complete profile after 2 seconds
      setTimeout(() => {
        navigate('/register/complete-profile');
      }, 2000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError(null);

    try {
      await apiService.register({ email });
      setResendTimer(60); // 60 seconds cooldown
      setOtpCode('');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
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
            <ShieldCheck size={40} color="white" />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            We've sent a 6-digit code to
          </Typography>
          <Typography variant="body2" color="primary" fontWeight="600">
            {email}
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
              Email verified successfully! Redirecting...
            </Alert>
          )}

          <TextField
            fullWidth
            name="otpCode"
            placeholder="Enter 6-digit code"
            value={otpCode}
            onChange={handleChange}
            sx={{ 
              mb: 3,
              '& input': {
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                fontWeight: 600,
              }
            }}
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]*',
              inputMode: 'numeric',
            }}
            disabled={loading || success}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || success || otpCode.length !== 6}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify Email'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Didn't receive the code?{' '}
            {resendTimer > 0 ? (
              <Typography component="span" color="text.secondary">
                Resend in {resendTimer}s
              </Typography>
            ) : (
              <MuiLink
                component="button"
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </MuiLink>
            )}
          </Typography>
        </form>
      </Card>
    </Box>
  );
};

export default VerifyEmail;
