import React, { useState, useEffect, useCallback, useMemo, Suspense, memo } from 'react';
import {
  Box,
  Typography,
  Grid,
  CardContent,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  GpsFixed,
  Assessment,
  Warning,
  CheckCircle,
  Info,
  MonetizationOn,
  Category,
  Timeline
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { 
  Activity,
  BarChart3,
  Brain,
  ChartArea,
  Telescope
} from 'lucide-react';
import { analyticsApi } from '../../services/api';
import {
  SpendingAnalytics,
  MonthlyTrends,
  BudgetAnalytics,
  GoalAnalytics,
  AccountAnalytics,
  FinancialInsights
} from '../../types/analytics';
import { NeumorphicPaper as EnterprisePaper } from '../common/NeumorphicPaper';

// Lazy load heavy components
const NetWorthWidget = React.lazy(() => import('../dashboard/NetWorthWidget'));
const FinancialHealthScore = React.lazy(() => import('../dashboard/FinancialHealthScore'));
const SmartInsightsWidget = React.lazy(() => import('../dashboard/SmartInsightsWidget'));

// Simple animation components without external dependencies
const SimpleReveal = memo(({ children, ...props }: any) => (
  <Box {...props} sx={{ ...props.sx }}>{children}</Box>
));

const SimpleContainer = memo(({ children, ...props }: any) => (
  <Box {...props}>{children}</Box>
));

// Optimized animations with reduced motion support
const ReducedMotionBox = memo(({ children, ...props }: any) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return <Box {...props}>{children}</Box>;
  }
  
  return (
    <Box 
      {...props}
      sx={{
        ...props.sx,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          ...props.sx?.['&:hover']
        }
      }}
    >
      {children}
    </Box>
  );
});

// Optimized styled components with fallbacks
const AnalyticsCommandCenter = styled(Box)(({ theme }) => ({
  background: theme.space?.gradients?.galaxy || theme.palette.background.paper,
  borderRadius: theme.enterprise?.borderRadius?.large || theme.shape.borderRadius * 2,
  border: `1px solid ${theme.space?.colors?.nebula || theme.palette.divider}`,
  boxShadow: theme.enterprise?.shadows?.cosmic || theme.shadows[3],
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: theme.space?.gradients?.nebula || theme.palette.primary.main,
  },
}));

const CosmicAnalyticsCard = styled(ReducedMotionBox)(({ theme }) => ({
  background: theme.space?.gradients?.galaxy || theme.palette.background.paper,
  borderRadius: theme.enterprise?.borderRadius?.medium || theme.shape.borderRadius,
  border: `1px solid ${theme.space?.colors?.stellar || theme.palette.divider}`,
  boxShadow: theme.enterprise?.shadows?.nebula || theme.shadows[2],
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '2px',
    background: theme.space?.gradients?.stellar || theme.palette.primary.main,
  },
}));

// Error boundary component (simplified fallback wrapper)
const ChartErrorBoundary: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = () => setHasError(true);
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <>
        {fallback || (
          <Alert severity="error" sx={{ m: 2 }}>
            Unable to load chart. Please refresh the page.
          </Alert>
        )}
      </>
    );
  }

  return <>{children}</>;
};

// Loading skeleton component
const AnalyticsSkeleton = memo(() => (
  <Grid container spacing={3}>
    {[...Array(4)].map((_, i) => (
      <Grid item xs={12} md={3} key={i}>
        <Skeleton variant="rectangular" height={120} />
      </Grid>
    ))}
    {[...Array(4)].map((_, i) => (
      <Grid item xs={12} md={6} key={i}>
        <Skeleton variant="rectangular" height={400} />
      </Grid>
    ))}
  </Grid>
));

// Custom hook for analytics data with caching and error handling
const useAnalyticsData = (selectedPeriod: string) => {
  const [data, setData] = useState({
    spendingAnalytics: null as SpendingAnalytics | null,
    monthlyTrends: null as MonthlyTrends | null,
    budgetAnalytics: null as BudgetAnalytics | null,
    goalAnalytics: null as GoalAnalytics | null,
    accountAnalytics: null as AccountAnalytics | null,
    insights: null as FinancialInsights | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache for API responses (simple in-memory cache)
  const cache = useMemo(() => new Map(), []);

  const loadAnalyticsData = useCallback(async () => {
    const cacheKey = `analytics-${selectedPeriod}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load data sequentially to reduce server load
      const spendingResponse = await analyticsApi.getSpendingAnalytics(parseInt(selectedPeriod));
      const trendsResponse = await analyticsApi.getMonthlyTrends(6);
      const budgetResponse = await analyticsApi.getBudgetAnalytics();
      const goalResponse = await analyticsApi.getGoalAnalytics();
      const accountResponse = await analyticsApi.getAccountAnalytics();
      const insightsResponse = await analyticsApi.getFinancialInsights();

      const newData = {
        spendingAnalytics: spendingResponse.data,
        monthlyTrends: trendsResponse.data,
        budgetAnalytics: budgetResponse.data,
        goalAnalytics: goalResponse.data,
        accountAnalytics: accountResponse.data,
        insights: insightsResponse.data,
      };

      // Cache the data
      cache.set(cacheKey, newData);
      setData(newData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, cache]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  return { ...data, loading, error, refetch: loadAnalyticsData };
};

const Analytics: React.FC = () => {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  
  const {
    spendingAnalytics,
    monthlyTrends,
    budgetAnalytics,
    goalAnalytics,
    accountAnalytics,
    insights,
    loading,
    error,
    refetch
  } = useAnalyticsData(selectedPeriod);

  // Memoized utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ON_TRACK': return theme.palette.success.main;
      case 'WARNING': return theme.palette.warning.main;
      case 'OVER_BUDGET': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  }, [theme]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'ON_TRACK': return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'WARNING': return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'OVER_BUDGET': return <Warning sx={{ color: theme.palette.error.main }} />;
      default: return <Info sx={{ color: theme.palette.grey[500] }} />;
    }
  }, [theme]);

  // Memoized overview data
  const overviewData = useMemo(() => [
    {
      title: 'Total Income',
      value: spendingAnalytics ? formatCurrency(spendingAnalytics.totalIncome) : '-',
      icon: <TrendingUp color="primary" />,
      color: 'primary'
    },
    {
      title: 'Total Expenses',
      value: spendingAnalytics ? formatCurrency(spendingAnalytics.totalExpenses) : '-',
      icon: <TrendingDown color="error" />,
      color: 'error'
    },
    {
      title: 'Net Savings',
      value: spendingAnalytics ? formatCurrency(spendingAnalytics.netSavings) : '-',
      icon: <AccountBalanceWallet color="primary" />,
      color: spendingAnalytics && spendingAnalytics.netSavings >= 0 ? 'success' : 'error'
    },
    {
      title: 'Total Balance',
      value: accountAnalytics ? formatCurrency(accountAnalytics.totalBalance) : '-',
      icon: <MonetizationOn color="primary" />,
      color: 'primary'
    }
  ], [spendingAnalytics, accountAnalytics, formatCurrency]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <AnalyticsSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <button onClick={refetch} style={{ marginLeft: 8 }}>
              Retry
            </button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <SimpleReveal>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <ChartArea size={32} style={{ marginRight: 16, color: '#8B5CF6' }} />
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
              color: 'primary.main',
              textShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }}>
              Financial Analytics
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 3 months</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </SimpleReveal>

      {/* Advanced Analytics Widgets */}
      <SimpleContainer>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Net Worth Analysis */}
          <Grid item xs={12}>
            <AnalyticsCommandCenter>
              <Box display="flex" alignItems="center" mb={3}>
                <BarChart3 size={24} style={{ marginRight: 12, color: '#06B6D4' }} />
                <Typography variant="h5" fontWeight="700" sx={{ color: 'info.main' }}>
                  🌌 Net Worth Trajectory Analysis
                </Typography>
              </Box>
              <Suspense fallback={<Skeleton variant="rectangular" height={300} />}>
                <ChartErrorBoundary>
                  <NetWorthWidget period={parseInt(selectedPeriod)} />
                </ChartErrorBoundary>
              </Suspense>
            </AnalyticsCommandCenter>
          </Grid>

          {/* Financial Health Score */}
          <Grid item xs={12} lg={6}>
            <CosmicAnalyticsCard>
              <Box display="flex" alignItems="center" mb={3}>
                <Activity size={24} style={{ marginRight: 12, color: '#10B981' }} />
                <Typography variant="h5" fontWeight="700" sx={{ color: 'success.main' }}>
                  ⚡ System Health Matrix
                </Typography>
              </Box>
              <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
                <ChartErrorBoundary>
                  <FinancialHealthScore />
                </ChartErrorBoundary>
              </Suspense>
            </CosmicAnalyticsCard>
          </Grid>

          {/* Smart Insights */}
          <Grid item xs={12} lg={6}>
            <CosmicAnalyticsCard>
              <Box display="flex" alignItems="center" mb={3}>
                <Brain size={24} style={{ marginRight: 12, color: '#EC4899' }} />
                <Typography variant="h5" fontWeight="700" sx={{ color: 'error.main' }}>
                  🧠 AI Financial Intelligence
                </Typography>
              </Box>
              <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
                <ChartErrorBoundary>
                  <SmartInsightsWidget />
                </ChartErrorBoundary>
              </Suspense>
            </CosmicAnalyticsCard>
          </Grid>
        </Grid>
      </SimpleContainer>

      {/* Detailed Analytics Section */}
      <AnalyticsCommandCenter sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Assessment sx={{ fontSize: 24, marginRight: 1.5, color: '#8B5CF6' }} />
          <Typography variant="h5" fontWeight="700" sx={{ color: 'primary.main' }}>
            📊 Detailed Financial Metrics
          </Typography>
        </Box>

        {/* Financial Insights */}
        {insights && insights.insights.length > 0 && (
          <EnterprisePaper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Assessment sx={{ mr: 1 }} />
              Financial Insights
            </Typography>
            <Grid container spacing={2}>
              {insights.insights.map((insight: string, index: number) => (
                <Grid item xs={12} md={6} key={index}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    {insight}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </EnterprisePaper>
        )}

        <Grid container spacing={3}>
          {/* Overview Cards */}
          {overviewData.map((item, index) => (
            <Grid item xs={12} md={3} key={index}>
              <EnterprisePaper sx={{ height: '100%', minHeight: 120 }}>
                <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="h6" color={`${item.color}.main`}>
                        {item.value}
                      </Typography>
                    </Box>
                    {item.icon}
                  </Box>
                </CardContent>
              </EnterprisePaper>
            </Grid>
          ))}

          {/* Enhanced Spending Analytics */}
          <Grid item xs={12} md={6}>
            <EnterprisePaper sx={{ p: 3, height: '100%', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Category sx={{ mr: 1 }} />
                Spending by Category
              </Typography>
              {spendingAnalytics && spendingAnalytics.categoryBreakdown.length > 0 ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={spendingAnalytics.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ categoryName, percentage }) => `${categoryName} (${percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {spendingAnalytics.categoryBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box mt={2} sx={{ flexGrow: 1 }}>
                    {spendingAnalytics.categoryBreakdown.slice(0, 5).map((category: any, index: number) => (
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
                          {formatCurrency(category.amount)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">No spending data available</Typography>
                </Box>
              )}
            </EnterprisePaper>
          </Grid>

          {/* Enhanced Spending Trends Bar Chart */}
          <Grid item xs={12} md={6}>
            <EnterprisePaper sx={{ p: 3, height: '100%', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Assessment sx={{ mr: 1 }} />
                Category Spending Trends
              </Typography>
              {spendingAnalytics && spendingAnalytics.categoryBreakdown.length > 0 ? (
                <Box sx={{ flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={spendingAnalytics.categoryBreakdown.slice(0, 6)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="categoryName" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="amount" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]}>
                        {spendingAnalytics.categoryBreakdown.slice(0, 6).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              )}
            </EnterprisePaper>
          </Grid>

          {/* Monthly Trends */}
          <Grid item xs={12} md={6}>
            <EnterprisePaper sx={{ p: 3, height: '100%', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Timeline sx={{ mr: 1 }} />
                Monthly Trends
              </Typography>
              {monthlyTrends && monthlyTrends.trends.length > 0 ? (
                <Box sx={{ flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyTrends.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke={theme.palette.success.main} name="Income" />
                      <Line type="monotone" dataKey="expenses" stroke={theme.palette.error.main} name="Expenses" />
                      <Line type="monotone" dataKey="savings" stroke={theme.palette.primary.main} name="Savings" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">No trend data available</Typography>
                </Box>
              )}
            </EnterprisePaper>
          </Grid>

          {/* Budget Progress */}
          <Grid item xs={12} md={6}>
            <EnterprisePaper sx={{ p: 3, height: '100%', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Assessment sx={{ mr: 1 }} />
                Budget Progress
              </Typography>
              {budgetAnalytics && budgetAnalytics.budgetProgress.length > 0 ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box mb={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            {budgetAnalytics.budgetsOnTrack}
                          </Typography>
                          <Typography variant="caption">On Track</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="warning.main">
                            {budgetAnalytics.totalBudgets - budgetAnalytics.budgetsOnTrack - budgetAnalytics.budgetsOverBudget}
                          </Typography>
                          <Typography variant="caption">Warning</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="error.main">
                            {budgetAnalytics.budgetsOverBudget}
                          </Typography>
                          <Typography variant="caption">Over Budget</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <List dense>
                      {budgetAnalytics.budgetProgress.slice(0, 5).map((budget: any) => (
                        <React.Fragment key={budget.budgetId}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'transparent' }}>
                                {getStatusIcon(budget.status)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={budget.budgetName}
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(budget.percentageUsed, 100)}
                                    sx={{
                                      mt: 1,
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: getStatusColor(budget.status)
                                      }
                                    }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">No budget data available</Typography>
                </Box>
              )}
            </EnterprisePaper>
          </Grid>

          {/* Goal Progress */}
          <Grid item xs={12} md={6}>
            <EnterprisePaper sx={{ p: 3, height: '100%', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <GpsFixed sx={{ mr: 1 }} />
                Goal Progress
              </Typography>
              {goalAnalytics && goalAnalytics.goalProgress.length > 0 ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box mb={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="primary.main">
                            {goalAnalytics.totalGoals}
                          </Typography>
                          <Typography variant="caption">Total Goals</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            {goalAnalytics.completedGoals}
                          </Typography>
                          <Typography variant="caption">Completed</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <List dense>
                      {goalAnalytics.goalProgress.slice(0, 5).map((goal: any) => (
                        <React.Fragment key={goal.goalId}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: goal.isCompleted ? 'success.main' : 'primary.main' }}>
                                <GpsFixed />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={goal.goalName}
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(goal.percentageComplete, 100)}
                                    sx={{
                                      mt: 1,
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
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">No goal data available</Typography>
                </Box>
              )}
            </EnterprisePaper>
          </Grid>
        </Grid>
      </AnalyticsCommandCenter>
    </Box>
  );
};

export default Analytics;
