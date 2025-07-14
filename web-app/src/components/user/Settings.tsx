import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Save, User, Bell, Palette, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NeumorphicPaper } from '../common/NeumorphicPaper';
import { LoadingButton } from '../common/LoadingButton';
import api from '../../services/api';

interface UserSettings {
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
  };
  privacy: {
    profileVisibility: string;
    dataSharing: boolean;
  };
}

const currencies = [
  { code: 'PHP', name: 'Philippine Peso (₱)', symbol: '₱' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
];

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'PHP',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      budgetAlerts: true,
      goalReminders: true,
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user settings from API
    const loadSettings = async () => {
      try {
        const response = await api.get('/api/user/settings');
        if (response.data) {
          setSettings(prev => ({ ...prev, ...response.data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put('/api/user/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section: string, key: string, value: any) => {
    if (section === '') {
      // Handle top-level settings like currency and language
      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));
    } else {
      // Handle nested settings
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof UserSettings] as any),
          [key]: value,
        },
      }));
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <NeumorphicPaper>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <User size={20} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  General
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={settings.currency}
                      label="Currency"
                      onChange={(e) => handleSettingChange('', 'currency', e.target.value)}
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={(e) => handleSettingChange('', 'language', e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="fil">Filipino</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </NeumorphicPaper>
        </Grid>

        {/* Theme Settings */}
        <Grid item xs={12}>
          <NeumorphicPaper>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette size={20} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Appearance
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={themeMode}
                  label="Theme"
                  onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark' | 'system')}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </NeumorphicPaper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <NeumorphicPaper>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Bell size={20} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                  }
                  label="Push notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.budgetAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'budgetAlerts', e.target.checked)}
                    />
                  }
                  label="Budget alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.goalReminders}
                      onChange={(e) => handleSettingChange('notifications', 'goalReminders', e.target.checked)}
                    />
                  }
                  label="Goal reminders"
                />
              </Box>
            </CardContent>
          </NeumorphicPaper>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <NeumorphicPaper>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Shield size={20} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Privacy
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={settings.privacy.profileVisibility}
                    label="Profile Visibility"
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                  >
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="public">Public</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                    />
                  }
                  label="Allow anonymous data sharing for app improvement"
                />
              </Box>
            </CardContent>
          </NeumorphicPaper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              loading={loading}
              onClick={handleSave}
              variant="contained"
              startIcon={<Save size={16} />}
              sx={{ minWidth: 120 }}
            >
              Save Settings
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
