import React, { useState, useRef } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ReceiptFABProps {
  onUploadReceipt: (file: File) => void;
  onTakePhoto: () => void;
  onAddTransaction: () => void;
  onAddIncome: () => void;
}

const ReceiptFAB: React.FC<ReceiptFABProps> = ({
  onUploadReceipt,
  onTakePhoto,
  onAddTransaction,
  onAddIncome
}) => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadReceipt(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleTakePhoto = () => {
    onTakePhoto();
    setOpen(false);
  };

  const handleAddTransaction = () => {
    onAddTransaction();
    setOpen(false);
  };

  const handleAddIncome = () => {
    onAddIncome();
    setOpen(false);
  };

  const actions = [
    {
      icon: <UploadIcon />,
      name: 'Upload Receipt',
      onClick: handleUploadClick,
      color: theme.palette.primary.main
    },
    {
      icon: <CameraIcon />,
      name: 'Take Photo',
      onClick: handleTakePhoto,
      color: theme.palette.secondary.main
    },
    {
      icon: <ExpenseIcon />,
      name: 'Add Expense',
      onClick: handleAddTransaction,
      color: theme.palette.error.main
    },
    {
      icon: <IncomeIcon />,
      name: 'Add Income',
      onClick: handleAddIncome,
      color: theme.palette.success.main
    }
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf"
        style={{ display: 'none' }}
      />
      
      <SpeedDial
        ariaLabel="Add transaction or receipt"
        sx={{
          '& .MuiFab-primary': {
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
            boxShadow: theme.palette.mode === 'dark' 
              ? 'inset 2px 2px 5px #1a1a1a, inset -2px -2px 5px #2c2c2c'
              : 'inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #f9f9f9',
            '&:hover': {
              background: `linear-gradient(145deg, ${theme.palette.action.hover} 0%, ${theme.palette.background.paper} 100%)`,
            }
          }
        }}
        icon={<SpeedDialIcon icon={<AddIcon />} openIcon={<ReceiptIcon />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
            sx={{
              '& .MuiFab-primary': {
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${action.color}20 100%)`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? 'inset 2px 2px 5px #1a1a1a, inset -2px -2px 5px #2c2c2c'
                  : 'inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #f9f9f9',
                color: action.color,
                '&:hover': {
                  background: `linear-gradient(145deg, ${action.color}20 0%, ${theme.palette.background.paper} 100%)`,
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default ReceiptFAB;
