import React, { useState } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as IncomeIcon,
  ShoppingCart as ExpenseIcon,
  SwapHoriz as TransferIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { TransactionType, CreateTransactionRequest, Account, Category } from '../../types/financial';
import { transactionApi, accountApi, categoryApi } from '../../services/api';

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  '& .MuiFab-primary': {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    }
  }
}));

interface QuickTransactionForm {
  type: TransactionType;
  accountId: number;
  categoryId: number;
  amount: string;
  description: string;
  transactionDate: string;
  toAccountId?: number;
}

const QuickActionsFAB: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [form, setForm] = useState<QuickTransactionForm>({
    type: TransactionType.EXPENSE,
    accountId: 0,
    categoryId: 0,
    amount: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    toAccountId: undefined
  });

  const speedDialActions = [
    {
      icon: <ExpenseIcon />,
      name: 'Add Expense',
      type: TransactionType.EXPENSE,
      color: theme.palette.error.main
    },
    {
      icon: <IncomeIcon />,
      name: 'Add Income',
      type: TransactionType.INCOME,
      color: theme.palette.success.main
    },
    {
      icon: <TransferIcon />,
      name: 'Transfer',
      type: TransactionType.TRANSFER,
      color: theme.palette.info.main
    }
  ];

  const loadData = async () => {
    try {
      const [accountsResponse, categoriesResponse] = await Promise.all([
        accountApi.getAll(),
        categoryApi.getAll()
      ]);
      setAccounts(accountsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load accounts and categories');
    }
  };

  const handleActionClick = (actionType: TransactionType) => {
    setForm(prev => ({
      ...prev,
      type: actionType,
      categoryId: 0,
      toAccountId: undefined
    }));
    setOpen(false);
    setDialogOpen(true);
    loadData();
  };

  const handleInputChange = (field: keyof QuickTransactionForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const transactionData: CreateTransactionRequest = {
        accountId: form.accountId,
        categoryId: form.categoryId,
        amount: parseFloat(form.amount),
        type: form.type,
        description: form.description,
        transactionDate: form.transactionDate,
        ...(form.type === TransactionType.TRANSFER && { toAccountId: form.toAccountId })
      };

      await transactionApi.create(transactionData);
      
      setSuccess('Transaction added successfully!');
      setTimeout(() => {
        setDialogOpen(false);
        setSuccess(null);
        resetForm();
        // Trigger a page refresh or emit an event to update the dashboard
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      type: TransactionType.EXPENSE,
      accountId: 0,
      categoryId: 0,
      amount: '',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      toAccountId: undefined
    });
  };

  const filteredCategories = categories.filter(cat => 
    form.type === TransactionType.TRANSFER ? true : cat.type === form.type
  );

  const isFormValid = () => {
    return form.accountId > 0 && 
           form.categoryId > 0 && 
           form.amount && 
           parseFloat(form.amount) > 0 &&
           (form.type !== TransactionType.TRANSFER || form.toAccountId);
  };

  const getDialogTitle = () => {
    switch (form.type) {
      case TransactionType.INCOME:
        return 'Quick Add Income';
      case TransactionType.EXPENSE:
        return 'Quick Add Expense';
      case TransactionType.TRANSFER:
        return 'Quick Transfer';
      default:
        return 'Quick Add Transaction';
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(numAmount);
  };

  return (
    <>
      <StyledSpeedDial
        ariaLabel="Quick Actions"
        icon={<SpeedDialIcon icon={<AddIcon />} openIcon={<CloseIcon />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={React.cloneElement(action.icon, { style: { color: action.color } })}
            tooltipTitle={action.name}
            onClick={() => handleActionClick(action.type)}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: action.color,
                  '& svg': {
                    color: 'white !important'
                  }
                }
              }
            }}
          />
        ))}
      </StyledSpeedDial>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
              : 'linear-gradient(145deg, #ffffff, #f5f5f5)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {form.type === TransactionType.INCOME && <IncomeIcon sx={{ mr: 1, color: 'success.main' }} />}
            {form.type === TransactionType.EXPENSE && <ExpenseIcon sx={{ mr: 1, color: 'error.main' }} />}
            {form.type === TransactionType.TRANSFER && <TransferIcon sx={{ mr: 1, color: 'info.main' }} />}
            {getDialogTitle()}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                value={form.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                helperText={form.amount ? `Amount: ${formatCurrency(form.amount)}` : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>From Account</InputLabel>
                <Select
                  value={form.accountId}
                  label="From Account"
                  onChange={(e) => handleInputChange('accountId', e.target.value)}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: account.color,
                            mr: 1
                          }}
                        />
                        {account.name} ({formatCurrency(account.balance.toString())})
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {form.type === TransactionType.TRANSFER && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>To Account</InputLabel>
                  <Select
                    value={form.toAccountId || ''}
                    label="To Account"
                    onChange={(e) => handleInputChange('toAccountId', e.target.value)}
                  >
                    {accounts.filter(acc => acc.id !== form.accountId).map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: account.color,
                              mr: 1
                            }}
                          />
                          {account.name} ({formatCurrency(account.balance.toString())})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={form.categoryId}
                  label="Category"
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                >
                  {filteredCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: category.color,
                            mr: 1
                          }}
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={2}
                placeholder="Enter transaction description..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction Date"
                type="date"
                value={form.transactionDate}
                onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid() || loading}
            sx={{
              background: form.type === TransactionType.INCOME 
                ? `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                : form.type === TransactionType.EXPENSE
                ? `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
                : `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              '&:hover': {
                background: form.type === TransactionType.INCOME 
                  ? `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`
                  : form.type === TransactionType.EXPENSE
                  ? `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`
                  : `linear-gradient(45deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`
              }
            }}
          >
            {loading ? 'Adding...' : `Add ${form.type === TransactionType.INCOME ? 'Income' : form.type === TransactionType.EXPENSE ? 'Expense' : 'Transfer'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickActionsFAB;
