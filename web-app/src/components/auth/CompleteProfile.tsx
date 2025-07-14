import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Eye, EyeOff, User, Lock, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { CompleteProfileRequest } from '../../types/auth';
import { AxiosError } from 'axios';
import { format } from 'date-fns';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formData, setFormData] = useState<Omit<CompleteProfileRequest, 'email'>>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
  });
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

  useEffect(() => {
    // Check if email is in session storage
    const email = sessionStorage.getItem('registrationEmail');
    if (!email) {
      navigate('/register');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
    setFieldErrors({});
  };

  const handleUsernameBlur = async () => {
    if (formData.username.length < 3) return;
    
    setCheckingUsername(true);
    try {
      const exists = await apiService.checkUsernameExists(formData.username);
      if (exists) {
        setFieldErrors({ username: 'Username is already taken' });
      }
    } catch (err) {
      console.error('Failed to check username:', err);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const email = sessionStorage.getItem('registrationEmail');
    if (!email) {
      navigate('/register');
      return;
    }

    if (!dateOfBirth) {
      setFieldErrors({ dateOfBirth: 'Date of birth is required' });
      setLoading(false);
      return;
    }

    const data: CompleteProfileRequest = {
      email,
      ...formData,
      dateOfBirth: format(dateOfBirth, 'yyyy-MM-dd'),
    };

    try {
      const response = await apiService.completeProfile(data);
      login(response.user);
      sessionStorage.removeItem('registrationEmail');
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError<{ message: string; errors?: Record<string, string> }>;
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
      } else {
        setError(error.response?.data?.message || 'Failed to complete profile. Please try again.');
      }
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
        py: 4,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
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
            <UserCheck size={40} color="white" />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Just a few more details to get started
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
                required
              />
              <TextField
                fullWidth
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
                required
              />
            </Box>

            <TextField
              fullWidth
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleUsernameBlur}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username || 'Choose a unique username'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    @
                  </InputAdornment>
                ),
                endAdornment: checkingUsername && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChange={(newValue) => setDateOfBirth(newValue as Date | null)}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!fieldErrors.dateOfBirth}
                      helperText={fieldErrors.dateOfBirth}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Calendar size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
              <TextField
                fullWidth
                select
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                error={!!fieldErrors.gender}
                helperText={fieldErrors.gender}
                disabled={loading}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </TextField>
            </Box>

            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || 'At least 8 characters'}
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
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !!fieldErrors.username}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default CompleteProfile;
