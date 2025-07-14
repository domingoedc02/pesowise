import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, Trash2, Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  Budget, 
  BudgetPeriod, 
  CreateBudgetRequest, 
  UpdateBudgetRequest,
  Category 
} from '../../types/financial';
import { budgetApi, categoryApi } from '../../services/api';
import { DashboardWrapper } from '../DashboardWrapper';

const BudgetCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
    : 'linear-gradient(145deg, #e6e6e6, #ffffff)',
  boxShadow: theme.palette.mode === 'dark'
    ? '20px 20px 60px #1a1a1a, -20px -20px 60px #333333'
    : '20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '25px 25px 75px #1a1a1a, -25px -25px 75px #333333'
      : '25px 25px 75px #d1d1d1, -25px -25px 75px #ffffff',
  },
}));

export const BudgetList: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<CreateBudgetRequest>({
    name: '',
    categoryId: 0,
    amount: 0,
    period: BudgetPeriod.MONTHLY,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notifyPercentage: 80,
  });

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetApi.getAll();
      setBudgets(response.data);
    } catch (error) {
      setError('Failed to load budgets');
      console.error('Load budgets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        name: budget.name,
        categoryId: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        startDate: budget.startDate.split('T')[0],
        endDate: budget.endDate?.split('T')[0] || '',
        notifyPercentage: budget.notifyPercentage,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: '',
        categoryId: categories[0]?.id || 0,
        amount: 0,
        period: BudgetPeriod.MONTHLY,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notifyPercentage: 80,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingBudget) {
        const updateData: UpdateBudgetRequest = {
          amount: formData.amount,
          notifyPercentage: formData.notifyPercentage,
        };
        await budgetApi.update(editingBudget.id, updateData);
      } else {
        await budgetApi.create(formData);
      }
      await loadBudgets();
      handleCloseDialog();
    } catch (error) {
      console.error('Save budget error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetApi.delete(id);
        await loadBudgets();
      } catch (error) {
        console.error('Delete budget error:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getSpentPercentage = (spent: number, budget: number) => {
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  const getBudgetStatus = (spentPercentage: number, alertThreshold: number) => {
    if (spentPercentage >= 100) return { color: 'error', label: 'Over Budget', icon: AlertTriangle };
    if (spentPercentage >= alertThreshold) return { color: 'warning', label: 'Near Limit', icon: TrendingUp };
    return { color: 'success', label: 'On Track', icon: Target };
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
            Budget Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => handleOpenDialog()}
          >
            Create Budget
          </Button>
        </Box>

        <Grid container spacing={3}>
          {budgets.map((budget) => {
            const spentPercentage = getSpentPercentage(budget.spent, budget.amount);
            const status = getBudgetStatus(spentPercentage, budget.notifyPercentage);
            const StatusIcon = status.icon;

            return (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <BudgetCard>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {budget.categoryName}
                        </Typography>
                        <Chip
                          label={budget.period}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(budget)}
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(budget.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Budget Amount
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Spent: {formatCurrency(budget.spent)}
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {spentPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(spentPercentage, 100)}
                        color={status.color as 'success' | 'warning' | 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        icon={<StatusIcon size={16} />}
                        label={status.label}
                        color={status.color as 'success' | 'warning' | 'error'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        Remaining: {formatCurrency(Math.max(0, budget.amount - budget.spent))}
                      </Typography>
                    </Box>
                  </CardContent>
                </BudgetCard>
              </Grid>
            );
          })}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!editingBudget && (
                <>
                  <TextField
                    select
                    label="Category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    fullWidth
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as BudgetPeriod })}
                    fullWidth
                    required
                  >
                    {Object.values(BudgetPeriod).map((period) => (
                      <MenuItem key={period} value={period}>
                        {period}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
              <TextField
                label="Budget Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                fullWidth
                required
              />
              <TextField
                label="Alert Threshold (%)"
                type="number"
                value={formData.notifyPercentage}
                onChange={(e) => setFormData({ ...formData, notifyPercentage: parseInt(e.target.value) })}
                fullWidth
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingBudget ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardWrapper>
  );
};
