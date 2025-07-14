import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    space: {
      colors: {
        deepSpace: string;
        nebula: string;
        stellar: string;
        cosmic: string;
        starlight: string;
        galaxy: string;
        void: string;
        plasma: string;
      };
      gradients: {
        nebula: string;
        galaxy: string;
        cosmic: string;
        stellar: string;
        plasma: string;
        aurora: string;
        starfield: string;
      };
      effects: {
        glow: string;
        starGlow: string;
        nebulaGlow: string;
        plasmaGlow: string;
      };
      animations: {
        float: string;
        pulse: string;
        shimmer: string;
        orbit: string;
        twinkle: string;
      };
    };
    enterprise: {
      shadows: {
        soft: string;
        medium: string;
        strong: string;
        card: string;
        cosmic: string;
        nebula: string;
      };
      gradients: {
        primary: string;
        secondary: string;
        surface: string;
      };
      borderRadius: {
        small: number;
        medium: number;
        large: number;
      };
    };
  }
  interface ThemeOptions {
    space?: {
      colors?: {
        deepSpace?: string;
        nebula?: string;
        stellar?: string;
        cosmic?: string;
        starlight?: string;
        galaxy?: string;
        void?: string;
        plasma?: string;
      };
      gradients?: {
        nebula?: string;
        galaxy?: string;
        cosmic?: string;
        stellar?: string;
        plasma?: string;
        aurora?: string;
        starfield?: string;
      };
      effects?: {
        glow?: string;
        starGlow?: string;
        nebulaGlow?: string;
        plasmaGlow?: string;
      };
      animations?: {
        float?: string;
        pulse?: string;
        shimmer?: string;
        orbit?: string;
        twinkle?: string;
      };
    };
    enterprise?: {
      shadows?: {
        soft?: string;
        medium?: string;
        strong?: string;
        card?: string;
        cosmic?: string;
        nebula?: string;
      };
      gradients?: {
        primary?: string;
        secondary?: string;
        surface?: string;
      };
      borderRadius?: {
        small?: number;
        medium?: number;
        large?: number;
      };
    };
  }
}

const spaceTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6', // Cosmic purple
      light: '#A78BFA',
      dark: '#6B46C1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#06B6D4', // Stellar cyan
      light: '#67E8F9',
      dark: '#0891B2',
      contrastText: '#000000',
    },
    background: {
      default: '#0B1426', // Deep space
      paper: 'rgba(15, 23, 42, 0.95)', // Translucent space
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
    },
    error: {
      main: '#F87171',
      light: '#FCA5A5',
      dark: '#EF4444',
    },
    warning: {
      main: '#FBBF24',
      light: '#FCD34D',
      dark: '#F59E0B',
    },
    info: {
      main: '#60A5FA',
      light: '#93C5FD',
      dark: '#3B82F6',
    },
    success: {
      main: '#34D399',
      light: '#6EE7B7',
      dark: '#10B981',
    },
    divider: 'rgba(148, 163, 184, 0.2)',
    action: {
      hover: 'rgba(139, 92, 246, 0.08)',
      selected: 'rgba(139, 92, 246, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      color: '#F8FAFC',
      textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      color: '#F8FAFC',
      textShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      color: '#F8FAFC',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      color: '#F8FAFC',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.005em',
      color: '#F8FAFC',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '0.005em',
      color: '#F8FAFC',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#F8FAFC',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#CBD5E1',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#94A3B8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  space: {
    colors: {
      deepSpace: '#0B1426',
      nebula: '#8B5CF6',
      stellar: '#06B6D4',
      cosmic: '#A855F7',
      starlight: '#F8FAFC',
      galaxy: '#1E293B',
      void: '#000000',
      plasma: '#EC4899',
    },
    gradients: {
      nebula: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #EC4899 100%)',
      galaxy: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      cosmic: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
      stellar: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #6366F1 100%)',
      plasma: 'linear-gradient(135deg, #EC4899 0%, #F97316 50%, #EAB308 100%)',
      aurora: 'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #8B5CF6 100%)',
      starfield: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
    },
    effects: {
      glow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
      starGlow: '0 0 10px rgba(248, 250, 252, 0.8), 0 0 20px rgba(248, 250, 252, 0.6)',
      nebulaGlow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
      plasmaGlow: '0 0 25px rgba(236, 72, 153, 0.6), 0 0 50px rgba(236, 72, 153, 0.4)',
    },
    animations: {
      float: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `,
      shimmer: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `,
      orbit: `
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
      `,
      twinkle: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `,
    },
  },
  enterprise: {
    shadows: {
      soft: '0 2px 8px rgba(139, 92, 246, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 16px rgba(139, 92, 246, 0.2), 0 2px 6px rgba(0, 0, 0, 0.4)',
      strong: '0 8px 32px rgba(139, 92, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.5)',
      card: '0 4px 20px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.4)',
      cosmic: '0 0 40px rgba(139, 92, 246, 0.3), 0 8px 32px rgba(0, 0, 0, 0.6)',
      nebula: '0 0 60px rgba(168, 85, 247, 0.4), 0 12px 48px rgba(0, 0, 0, 0.7)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
      secondary: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
      surface: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
    },
    borderRadius: {
      small: 6,
      medium: 12,
      large: 20,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #0B1426 0%, #000000 100%)
          `,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.15), transparent),
              radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.1), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.1), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.15), transparent),
              radial-gradient(1px 1px at 160px 30px, rgba(255, 255, 255, 0.1), transparent)
            `,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 100px',
            animation: 'twinkle 4s ease-in-out infinite alternate',
            pointerEvents: 'none',
            zIndex: -1,
          },
          '@keyframes twinkle': {
            '0%': { opacity: 0.3 },
            '100%': { opacity: 0.8 }
          }
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            '&::before': {
              left: '100%',
            },
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
            boxShadow: '0 6px 24px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)',
          },
        },
        outlined: {
          borderColor: '#8B5CF6',
          color: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          borderWidth: '2px',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: '#A855F7',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: '2px',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          },
        },
        text: {
          color: '#8B5CF6',
          '&:hover': {
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: '1px solid rgba(139, 92, 246, 0.2)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
          },
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.4)',
        },
        elevation2: {
          boxShadow: '0 6px 24px rgba(139, 92, 246, 0.2), 0 3px 12px rgba(0, 0, 0, 0.5)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.25), 0 4px 16px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 12px 40px rgba(139, 92, 246, 0.25), 0 6px 16px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(139, 92, 246, 0.5)',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8B5CF6',
              borderWidth: '2px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
        },
        colorSuccess: {
          background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
        },
        colorError: {
          background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          height: 8,
        },
        bar: {
          borderRadius: 6,
          background: 'linear-gradient(90deg, #8B5CF6 0%, #A855F7 100%)',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          '& .MuiCircularProgress-circle': {
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
          color: '#FFFFFF',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#F8FAFC',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(11, 20, 38, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(139, 92, 246, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '1px',
            height: '100%',
            background: 'linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          transition: 'all 0.3s ease',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            borderLeft: '4px solid #8B5CF6',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
            '& .MuiListItemIcon-root': {
              color: '#8B5CF6',
              filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))',
            },
            '& .MuiListItemText-primary': {
              color: '#8B5CF6',
              fontWeight: 600,
              textShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
            },
          },
          '&:hover': {
            background: 'rgba(139, 92, 246, 0.08)',
            transform: 'translateX(4px)',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)',
          },
        },
      },
    },
  },
});

// Legacy theme for compatibility
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6B46C1',
      light: '#8B5CF6',
      dark: '#553C9A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F97316',
      light: '#FB923C',
      dark: '#EA580C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  enterprise: {
    shadows: {
      soft: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      strong: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      card: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      cosmic: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      nebula: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)',
      secondary: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      surface: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
    },
  },
  space: {
    colors: {
      deepSpace: '#0B1426',
      nebula: '#8B5CF6',
      stellar: '#06B6D4',
      cosmic: '#A855F7',
      starlight: '#F8FAFC',
      galaxy: '#1E293B',
      void: '#000000',
      plasma: '#EC4899',
    },
    gradients: {
      nebula: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #EC4899 100%)',
      galaxy: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      cosmic: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
      stellar: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #6366F1 100%)',
      plasma: 'linear-gradient(135deg, #EC4899 0%, #F97316 50%, #EAB308 100%)',
      aurora: 'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #8B5CF6 100%)',
      starfield: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
    },
    effects: {
      glow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
      starGlow: '0 0 10px rgba(248, 250, 252, 0.8), 0 0 20px rgba(248, 250, 252, 0.6)',
      nebulaGlow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
      plasmaGlow: '0 0 25px rgba(236, 72, 153, 0.6), 0 0 50px rgba(236, 72, 153, 0.4)',
    },
    animations: {
      float: '',
      pulse: '',
      shimmer: '',
      orbit: '',
      twinkle: '',
    },
  },
});

const darkTheme = spaceTheme; // Use space theme as dark theme

export { lightTheme, darkTheme, spaceTheme };
