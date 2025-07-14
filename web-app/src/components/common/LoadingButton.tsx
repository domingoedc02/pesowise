import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingIndicator?: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingIndicator,
  disabled,
  children,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? (loadingIndicator || <CircularProgress size={16} />) : props.startIcon}
    >
      {children}
    </Button>
  );
};
