import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Camera, Edit3, Save, X } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { NeumorphicPaper } from '../common/NeumorphicPaper';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImageUrl?: string;
  currency?: string;
  theme?: string;
  notifications: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: null as Date | null,
    gender: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      setProfile(response.data);
      setFormData({
        username: response.data.username || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth) : null,
        gender: response.data.gender || '',
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await api.put('/user/profile', {
        ...formData,
        dateOfBirth: formData.dateOfBirth?.toISOString().split('T')[0],
      });
      
      setProfile(response.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      updateUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        gender: profile.gender || '',
      });
    }
    setIsEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      setError(null);
      const response = await api.post('/user/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(prev => prev ? { ...prev, profileImageUrl: response.data.profileImageUrl } : null);
      setSuccess('Profile image updated successfully');
      if (user) {
        updateUser({ ...user, profileImageUrl: response.data.profileImageUrl });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setPasswordError(null);
      await api.post('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Failed to load profile</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          My Profile
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <NeumorphicPaper sx={{ p: 3, textAlign: 'center' }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  src={profile.profileImageUrl}
                  sx={{
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '3rem',
                  }}
                >
                  {profile.firstName?.[0] || profile.email?.[0]}
                </Avatar>
                {uploadingImage && (
                  <CircularProgress
                    size={150}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      marginLeft: '-75px',
                    }}
                  />
                )}
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <label htmlFor="profile-image-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: -10,
                      backgroundColor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  >
                    <Camera size={20} />
                  </IconButton>
                </label>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{profile.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => setPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </NeumorphicPaper>
          </Grid>

          <Grid item xs={12} md={8}>
            <NeumorphicPaper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Personal Information</Typography>
                {!isEditing ? (
                  <IconButton onClick={() => setIsEditing(true)}>
                    <Edit3 size={20} />
                  </IconButton>
                ) : (
                  <Box>
                    <IconButton onClick={handleCancel} disabled={saving}>
                      <X size={20} />
                    </IconButton>
                    <IconButton onClick={handleSave} disabled={saving}>
                      {saving ? <CircularProgress size={20} /> : <Save size={20} />}
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    disabled
                    InputProps={{
                      endAdornment: profile.isEmailVerified && (
                        <Typography variant="caption" color="success.main">
                          Verified
                        </Typography>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(date) => setFormData({ ...formData, dateOfBirth: date as Date | null })}
                    disabled={!isEditing}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!isEditing}
                  >
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box mt={3} pt={3} borderTop={1} borderColor="divider">
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </NeumorphicPaper>
          </Grid>
        </Grid>

        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            {passwordError && (
              <Alert severity="error" onClose={() => setPasswordError(null)} sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              margin="normal"
              error={passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
              helperText={
                passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handlePasswordChange} 
              variant="contained"
              disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};
