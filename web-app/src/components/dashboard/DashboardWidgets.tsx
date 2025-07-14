import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Refresh,
  Download,
  Visibility,
  Warning,
  CheckCircle,
  GpsFixed,
  AccountBalance,
  Receipt,
  Category
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { analyticsApi } from '../../services/api';
import { SpendingAnalytics, BudgetAnalytics, GoalAnalytics, AccountAnalytics } from '../../types/analytics';

const WidgetCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
    : 'linear-gradient(145deg, #e6e6e6, #ffffff)',
  boxShadow: theme.palette.mode === 'dark'
    ? '20px 20px 60px #1a1a1a, -20px -20px 60px #333333'
    : '20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '25px 25px 75px #1a1a1a, -25px -25px 75px #333333'
      : '25px 25px 75px #d1d1d1, -25px -25px 75px #ffffff',
  },
}));

interface DashboardWidgetsProps {
  period: number;
  onRefresh: () => void;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ period, onRefresh }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [spendingData, setSpendingData] = useState<SpendingAnalytics | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetAnalytics | null>(null);
  const [goalData, setGoalData] = useState<GoalAnalytics | null>(null);
  const [accountData, setAccountData] = useState<AccountAnalytics | null>(null);

  useEffect(() => {
    loadWidgetData();
  }, [period]);

  const loadWidgetData = async () => {
    try {
      setLoading(true);
      const [spending, budget, goal, account] = await Promise.all([
        analyticsApi.getSpendingAnalytics(period),
        analyticsApi.getBudgetAnalytics(),
        analyticsApi.getGoalAnalytics(),
        analyticsApi.getAccountAnalytics()
      ]);

      setSpendingData(spending.data);
      setBudgetData(budget.data);
      setGoalData(goal.data);
      setAccountData(account.data);
    } catch (error) {
      console.error('Error loading widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, widget: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedWidget(widget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWidget(null);
  };

  const handleExportData = (widget: string) => {
    // Implementation for exporting widget data
    console.log(`Exporting data for ${widget}`);
    handleMenuClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getHealthStatus = (percentage: number) => {
    if (percentage <= 70) return { color: 'success.main', icon: <CheckCircle />, label: 'Healthy' };
    if (percentage <= 90) return { color: 'warning.main', icon: <Warning />, label: 'Warning' };
    return { color: 'error.main', icon: <Warning />, label: 'Critical' };
  };

  return (
    <Grid container spacing={3}>
      {/* Spending Overview Widget */}
      <Grid item xs={12} lg={6}>
        <WidgetCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center">
                <Category sx={{ mr: 1 }} />
                Spending Overview
              </Typography>
              <IconButton onClick={(e) => handleMenuOpen(e, 'spending')} size="small">
                <MoreVert />
              </IconButton>
            </Box>

            {loading || !spendingData ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error.main">
                        {formatCurrency(spendingData.totalExpenses)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total Expenses
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h6" color={spendingData.netSavings >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(Math.abs(spendingData.netSavings))}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Net {spendingData.netSavings >= 0 ? 'Savings' : 'Deficit'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {spendingData.categoryBreakdown.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={spendingData.categoryBreakdown.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {spendingData.categoryBreakdown.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Top Categories
                  </Typography>
                  {spendingData.categoryBreakdown.slice(0, 3).map((category, index) => (
                    <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
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
                        <Typography variant="body2">{category.categoryName}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {category.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </WidgetCard>
      </Grid>

      {/* Budget Health Widget */}
      <Grid item xs={12} lg={6}>
        <WidgetCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center">
                <GpsFixed sx={{ mr: 1 }} />
                Budget Health
              </Typography>
              <IconButton onClick={(e) => handleMenuOpen(e, 'budget')} size="small">
                <MoreVert />
              </IconButton>
            </Box>

            {loading || !budgetData ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {budgetData.budgetsOnTrack}
                      </Typography>
                      <Typography variant="caption">On Track</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main">
                        {budgetData.totalBudgets - budgetData.budgetsOnTrack - budgetData.budgetsOverBudget}
                      </Typography>
                      <Typography variant="caption">Warning</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error.main">
                        {budgetData.budgetsOverBudget}
                      </Typography>
                      <Typography variant="caption">Over Budget</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <List dense>
                  {budgetData.budgetProgress.slice(0, 4).map((budget, index) => {
                    const status = getHealthStatus(budget.percentageUsed);
                    return (
                      <React.Fragment key={budget.budgetId}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'transparent', color: status.color }}>
                              {status.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">{budget.budgetName}</Typography>
                                <Chip 
                                  label={status.label} 
                                  size="small" 
                                  sx={{ bgcolor: status.color, color: 'white' }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(budget.percentageUsed, 100)}
                                  sx={{
                                    mt: 0.5,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: status.color
                                    }
                                  }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < Math.min(budgetData.budgetProgress.length, 4) - 1 && <Divider variant="inset" />}
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            )}
          </CardContent>
        </WidgetCard>
      </Grid>

      {/* Goal Progress Widget */}
      <Grid item xs={12} lg={6}>
        <WidgetCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center">
                <GpsFixed sx={{ mr: 1 }} />
                Goal Progress
              </Typography>
              <IconButton onClick={(e) => handleMenuOpen(e, 'goals')} size="small">
                <MoreVert />
              </IconButton>
            </Box>

            {loading || !goalData ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary.main">
                        {goalData.totalGoals}
                      </Typography>
                      <Typography variant="caption">Total Goals</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {goalData.completedGoals}
                      </Typography>
                      <Typography variant="caption">Completed</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {goalData.goalProgress.length > 0 ? (
                  <List dense>
                    {goalData.goalProgress.slice(0, 4).map((goal, index) => (
                      <React.Fragment key={goal.goalId}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: goal.isCompleted ? 'success.main' : 'primary.main',
                              width: 32,
                              height: 32
                            }}>
                              <GpsFixed />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={goal.goalName}
                            secondary={
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(goal.percentageComplete, 100)}
                                  sx={{
                                    mt: 0.5,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: goal.isCompleted ? theme.palette.success.main : theme.palette.primary.main
                                    }
                                  }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                  {goal.percentageComplete.toFixed(1)}% complete
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < Math.min(goalData.goalProgress.length, 4) - 1 && <Divider variant="inset" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No active goals. Create your first goal to start tracking progress!
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </WidgetCard>
      </Grid>

      {/* Account Balance Widget */}
      <Grid item xs={12} lg={6}>
        <WidgetCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center">
                <AccountBalance sx={{ mr: 1 }} />
                Account Balances
              </Typography>
              <IconButton onClick={(e) => handleMenuOpen(e, 'accounts')} size="small">
                <MoreVert />
              </IconButton>
            </Box>

            {loading || !accountData ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Box mb={3} textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {formatCurrency(accountData.totalBalance)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Balance across {accountData.totalAccounts} accounts
                  </Typography>
                </Box>

                {accountData.accountBreakdown.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={accountData.accountBreakdown.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="accountName" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="balance" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            )}
          </CardContent>
        </WidgetCard>
      </Grid>

      {/* Widget Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleExportData(selectedWidget || '')}>
          <Download sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
        <MenuItem onClick={() => { onRefresh(); handleMenuClose(); }}>
          <Refresh sx={{ mr: 1 }} />
          Refresh
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default DashboardWidgets;
