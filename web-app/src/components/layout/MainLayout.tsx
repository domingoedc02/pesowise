import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Rocket,
  Satellite,
  Star,
  Activity,
  Target,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';
import QuickActionsFAB from '../common/QuickActionsFAB';
import { ParticleBackground } from '../common/SpaceAnimations';

const drawerWidth = 240;

const navigationItems = [
  { text: 'Command Center', icon: <Rocket size={20} />, path: '/dashboard' },
  { text: 'Mission Analytics', icon: <Satellite size={20} />, path: '/analytics' },
  { text: 'Fleet Assets', icon: <Star size={20} />, path: '/wallet' },
  { text: 'Activity Log', icon: <Activity size={20} />, path: '/transactions' },
  { text: 'Mission Goals', icon: <Target size={20} />, path: '/goals' },
  { text: 'System Config', icon: <Settings size={20} />, path: '/settings' },
];

export const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode: themeMode, setMode: setThemeMode } = useThemeContext();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    handleThemeMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun size={20} />;
      case 'dark':
        return <Moon size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };

  const drawer = (
    <Box>
        <Toolbar>
          <Box display="flex" alignItems="center">
            <Rocket size={24} style={{ marginRight: 8, color: '#8B5CF6' }} />
            <Typography variant="h6" noWrap component="div" sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              textShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
            }}>
              🚀 PesoWise
            </Typography>
          </Box>
        </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', position: 'relative', minHeight: '100vh' }}>
      <ParticleBackground />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'PesoWise'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleThemeMenuOpen}
              sx={{
                backgroundColor: theme.palette.action.hover,
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              {getThemeIcon()}
            </IconButton>
            
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar
                src={user?.profileImageUrl}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user?.firstName?.[0] || user?.email?.[0]}
              </Avatar>
            </IconButton>
          </Box>
          
          <Menu
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={handleThemeMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleThemeChange('light')}>
              <ListItemIcon>
                <Sun size={16} />
              </ListItemIcon>
              Light
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('dark')}>
              <ListItemIcon>
                <Moon size={16} />
              </ListItemIcon>
              Dark
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('system')}>
              <ListItemIcon>
                <Monitor size={16} />
              </ListItemIcon>
              System
            </MenuItem>
          </Menu>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { handleNavigation('/profile'); handleProfileMenuClose(); }}>
              <ListItemIcon>
                <User size={16} />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleNavigation('/settings'); handleProfileMenuClose(); }}>
              <ListItemIcon>
                <Settings size={16} />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogOut size={16} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Outlet />
        
        {/* Global Quick Actions FAB */}
        <QuickActionsFAB />
      </Box>
    </Box>
  );
};
