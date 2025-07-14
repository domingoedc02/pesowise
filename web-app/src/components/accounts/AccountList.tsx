import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, Trash2, Plus, Wallet, CreditCard, Smartphone, Building2, TrendingUp } from 'lucide-react';
import { Account, AccountType, CreateAccountRequest, UpdateAccountRequest } from '../../types/financial';
import { accountApi } from '../../services/api';
import { DashboardWrapper } from '../DashboardWrapper';

const AccountCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
    : 'linear-gradient(145deg, #e6e6e6, #ffffff)',
  boxShadow: theme.palette.mode === 'dark'
    ? '20px 20px 60px #1a1a1a, -20px -20px 60px #333333'
    : '20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '25px 25px 75px #1a1a1a, -25px -25px 75px #333333'
      : '25px 25px 75px #d1d1d1, -25px -25px 75px #ffffff',
  },
}));

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case AccountType.BANK:
      return <Building2 size={24} />;
    case AccountType.CREDIT_CARD:
      return <CreditCard size={24} />;
    case AccountType.E_WALLET:
      return <Smartphone size={24} />;
    case AccountType.INVESTMENT:
      return <TrendingUp size={24} />;
    case AccountType.CASH:
    default:
      return <Wallet size={24} />;
  }
};

export const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: '',
    type: AccountType.BANK,
    initialBalance: 0,
    currency: 'PHP',
    color: '#2196f3',
    icon: '',
    description: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountApi.getAll();
      setAccounts(response.data);
    } catch (error) {
      setError('Failed to load accounts');
      console.error('Load accounts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        initialBalance: account.balance,
        currency: account.currency,
        color: account.color,
        icon: account.icon || '',
        description: account.description || '',
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: AccountType.BANK,
        initialBalance: 0,
        currency: 'PHP',
        color: '#2196f3',
        icon: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        const updateData: UpdateAccountRequest = {
          name: formData.name,
          color: formData.color,
          icon: formData.icon,
          description: formData.description,
        };
        await accountApi.update(editingAccount.id, updateData);
      } else {
        await accountApi.create(formData);
      }
      await loadAccounts();
      handleCloseDialog();
    } catch (error) {
      console.error('Save account error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await accountApi.delete(id);
        await loadAccounts();
      } catch (error) {
        console.error('Delete account error:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardWrapper>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardWrapper>
    );
  }

  if (error) {
    return (
      <DashboardWrapper>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="600">
            My Accounts
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => handleOpenDialog()}
          >
            Add Account
          </Button>
        </Box>

        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} md={6} lg={4} key={account.id}>
              <AccountCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${account.color}20`,
                          color: account.color,
                        }}
                      >
                        {getAccountIcon(account.type)}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {account.name}
                        </Typography>
                        <Chip
                          label={account.type}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(account)}
                      >
                        <Edit size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box mt={3}>
                    <Typography variant="h4" fontWeight="bold" color={account.balance >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(account.balance)}
                    </Typography>
                    {account.description && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {account.description}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </AccountCard>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Account Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              {!editingAccount && (
                <>
                  <TextField
                    select
                    label="Account Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
                    fullWidth
                    required
                  >
                    {Object.values(AccountType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Initial Balance"
                    type="number"
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) })}
                    fullWidth
                    required
                  />
                </>
              )}
              <TextField
                label="Color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardWrapper>
  );
};
