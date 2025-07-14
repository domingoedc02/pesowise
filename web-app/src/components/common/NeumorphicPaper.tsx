import React from 'react';
import { Paper, PaperProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export const EnterprisePaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.enterprise.borderRadius.medium,
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  boxShadow: theme.enterprise.shadows.card,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: theme.enterprise.shadows.medium,
    transform: 'translateY(-2px)',
  },
}));

// Keep the old export for backward compatibility during transition
export const NeumorphicPaper = EnterprisePaper;
export const NaturePaper = EnterprisePaper;
