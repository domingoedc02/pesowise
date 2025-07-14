import React from 'react';
import { Box } from '@mui/material';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};
