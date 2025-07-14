import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Card,
  CardContent,
  Typography, 
  LinearProgress,
  Chip, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Rocket, 
  Satellite, 
  Star, 
  Zap, 
  Target, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  AlertCircle
} from 'lucide-react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DashboardWrapper } from './DashboardWrapper';
import FinancialOverview from './dashboard/FinancialOverview';
import QuickStats from './dashboard/QuickStats';
import CashFlowChart from './dashboard/CashFlowChart';
import SpendingTrendsWidget from './dashboard/SpendingTrendsWidget';
import QuickActionsFAB from './common/QuickActionsFAB';
import { 
  StaggerContainer, 
  StaggerItem, 
  SpaceCard, 
  CosmicSpinner, 
  ScrollReveal,
  GlitchText,
  ParticleBackground
} from './common/SpaceAnimations';
import { dashboardApi } from '../services/api';
import { DashboardSummary, TransactionType } from '../types/financial';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const CommandCenter = styled(Box)(({ theme }) => ({
  background: theme.space.gradients.galaxy,
  borderRadius: theme.enterprise.borderRadius.large,
  border: `1px solid ${theme.space.colors.nebula}`,
  boxShadow: theme.enterprise.shadows.cosmic,
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
    background: theme.space.gradients.nebula,
  },
}));

const MissionStatusCard = styled(motion.div)(({ theme }) => ({
  background: theme.space.gradients.galaxy,
  borderRadius: theme.enterprise.borderRadius.medium,
  border: `1px solid ${theme.space.colors.stellar}`,
  boxShadow: theme.enterprise.shadows.nebula,
  padding: theme.spacing(2.5),
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '2px',
    background: theme.space.gradients.stellar,
  },
}));

const CosmicAlert = styled(Box)(({ theme }) => ({
  background: theme.space.gradients.plasma,
  borderRadius: theme.enterprise.borderRadius.medium,
  padding: theme.spacing(2),
  border: `1px solid ${theme.space.colors.plasma}`,
  boxShadow: `0 0 20px ${theme.space.colors.plasma}40`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '-10px',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    background: theme.space.colors.plasma,
    borderRadius: '50%',
    filter: 'blur(8px)',
    animation: 'pulse 2s ease-in-out infinite',
  },
}));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [period, setPeriod] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getSummary();
      setSummary(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };


  const handleExportData = () => {
    if (!summary) return;
    
    const data = {
      period: `Last ${period} days`,
      totalBalance: summary.totalBalance,
      monthlyIncome: summary.monthlyIncome,
      monthlyExpenses: summary.monthlyExpenses,
      savingsRate: summary.savingsRate,
      activeGoals: summary.activeGoals,
      completedGoals: summary.completedGoals,
      activeBudgets: summary.activeBudgets,
      exportDate: new Date().toISOString(),
      recentTransactions: summary.recentTransactions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesowise-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return <ArrowDownRight color="#4caf50" />;
      case TransactionType.EXPENSE:
        return <ArrowUpRight color="#f44336" />;
      case TransactionType.TRANSFER:
        return <Receipt color="#2196f3" />;
      default:
        return <Receipt />;
    }
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

  if (error || !summary) {
    return (
      <DashboardWrapper>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Failed to load dashboard data'}
        </Alert>
      </DashboardWrapper>
    );
  }

  const netCashFlow = summary.monthlyIncome - summary.monthlyExpenses;
  const isPositiveCashFlow = netCashFlow >= 0;

  return (
    <DashboardWrapper>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Welcome back, {user?.firstName || user?.username || 'User'}!
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(Number(e.target.value))}
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 3 months</MenuItem>
                <MenuItem value={365}>Last year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </Box>

        {/* Dashboard Overview - Core Financial Metrics */}
        <FinancialOverview summary={summary} loading={loading} period={period} />

        {/* Quick Stats */}
        <QuickStats summary={summary} loading={loading} />

        {/* Supporting Widgets */}
        <Box sx={{ mb: 4 }}>
          <CashFlowChart period={6} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <SpendingTrendsWidget period={period} />
        </Box>

            {/* Command Center - Financial Overview */}
            <ScrollReveal direction="up" delay={0.2}>
              <CommandCenter sx={{ mb: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Rocket size={24} style={{ marginRight: 12, color: '#8B5CF6' }} />
                  <GlitchText data-text="Mission Control Center">
                    <Typography variant="h5" fontWeight="700" sx={{ color: 'primary.main' }}>
                      🚀 Mission Control Center
                    </Typography>
                  </GlitchText>
                </Box>

                <StaggerContainer staggerDelay={0.1}>
                  <Grid container spacing={3}>
                    {/* Total Balance */}
                    <Grid item xs={12} md={6} lg={3}>
                      <StaggerItem>
                        <MissionStatusCard
                          whileHover={{ scale: 1.05, rotateY: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography color="text.secondary" gutterBottom sx={{ opacity: 0.8 }}>
                                🛸 Fleet Assets
                              </Typography>
                              <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
                                {formatCurrency(summary.totalBalance)}
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'primary.main', boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
                              <Satellite size={24} />
                            </Avatar>
                          </Box>
                        </MissionStatusCard>
                      </StaggerItem>
                    </Grid>

                    {/* Monthly Income */}
                    <Grid item xs={12} md={6} lg={3}>
                      <StaggerItem>
                        <MissionStatusCard
                          whileHover={{ scale: 1.05, rotateY: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography color="text.secondary" gutterBottom sx={{ opacity: 0.8 }}>
                                ⚡ Energy Intake
                              </Typography>
                              <Typography variant="h4" fontWeight="bold" sx={{ color: 'success.main' }}>
                                {formatCurrency(summary.monthlyIncome)}
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'success.main', boxShadow: '0 0 20px rgba(52, 211, 153, 0.5)' }}>
                              <Zap size={24} />
                            </Avatar>
                          </Box>
                        </MissionStatusCard>
                      </StaggerItem>
                    </Grid>

                    {/* Monthly Expenses */}
                    <Grid item xs={12} md={6} lg={3}>
                      <StaggerItem>
                        <MissionStatusCard
                          whileHover={{ scale: 1.05, rotateY: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography color="text.secondary" gutterBottom sx={{ opacity: 0.8 }}>
                                🔥 Fuel Consumption
                              </Typography>
                              <Typography variant="h4" fontWeight="bold" sx={{ color: 'error.main' }}>
                                {formatCurrency(summary.monthlyExpenses)}
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'error.main', boxShadow: '0 0 20px rgba(248, 113, 113, 0.5)' }}>
                              <Activity size={24} />
                            </Avatar>
                          </Box>
                        </MissionStatusCard>
                      </StaggerItem>
                    </Grid>

                    {/* Savings Rate */}
                    <Grid item xs={12} md={6} lg={3}>
                      <StaggerItem>
                        <MissionStatusCard
                          whileHover={{ scale: 1.05, rotateY: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography color="text.secondary" gutterBottom sx={{ opacity: 0.8 }}>
                                ⭐ Mission Success Rate
                              </Typography>
                              <Typography variant="h4" fontWeight="bold" sx={{ color: 'info.main' }}>
                                {summary.savingsRate.toFixed(1)}%
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'info.main', boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' }}>
                              <Star size={24} />
                            </Avatar>
                          </Box>
                        </MissionStatusCard>
                      </StaggerItem>
                    </Grid>
                  </Grid>
                </StaggerContainer>
              </CommandCenter>
            </ScrollReveal>

            {/* Mission Status */}
            <ScrollReveal direction="up" delay={0.4}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <SpaceCard>
                    <CommandCenter>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Target size={20} style={{ marginRight: 8, color: '#06B6D4' }} />
                        <Typography variant="h6" fontWeight="600">
                          🎯 Active Missions
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Ongoing Missions
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {summary.activeGoals}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Completed Missions
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {summary.completedGoals}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={summary.completedGoals / (summary.activeGoals + summary.completedGoals) * 100 || 0}
                          sx={{ 
                            height: 12, 
                            borderRadius: 6,
                            background: 'rgba(30, 41, 59, 0.8)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #06B6D4 0%, #8B5CF6 100%)',
                              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                            }
                          }}
                        />
                      </Box>
                    </CommandCenter>
                  </SpaceCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SpaceCard>
                    <CommandCenter>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Activity size={20} style={{ marginRight: 8, color: '#EC4899' }} />
                        <Typography variant="h6" fontWeight="600">
                          ⚡ System Status
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Active Systems
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {summary.activeBudgets}
                          </Typography>
                        </Box>
                        
                        {isPositiveCashFlow ? (
                          <CosmicAlert sx={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }}>
                            <Box display="flex" alignItems="center">
                              <TrendingUp size={16} style={{ marginRight: 8 }} />
                              <Typography variant="body2" fontWeight="bold">
                                🟢 Systems Optimal
                              </Typography>
                            </Box>
                          </CosmicAlert>
                        ) : (
                          <CosmicAlert>
                            <Box display="flex" alignItems="center">
                              <AlertTriangle size={16} style={{ marginRight: 8 }} />
                              <Typography variant="body2" fontWeight="bold">
                                🔴 System Alert
                              </Typography>
                            </Box>
                          </CosmicAlert>
                        )}

                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Net Energy Flow
                          </Typography>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{ 
                              color: isPositiveCashFlow ? "success.main" : "error.main",
                              textShadow: `0 0 10px ${isPositiveCashFlow ? '#10B981' : '#EF4444'}40`
                            }}
                          >
                            {formatCurrency(Math.abs(netCashFlow))}
                          </Typography>
                        </Box>
                      </Box>
                    </CommandCenter>
                  </SpaceCard>
                </Grid>
              </Grid>
            </ScrollReveal>

            {/* Activity Log */}
            <ScrollReveal direction="up" delay={0.6}>
              <SpaceCard>
                <CommandCenter>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Activity size={20} style={{ marginRight: 8, color: '#8B5CF6' }} />
                      <Typography variant="h6" fontWeight="600">
                        📡 Recent Activity Log
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={handleExportData}
                      disabled={!summary}
                      sx={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                        }
                      }}
                    >
                      📊 Export Data
                    </Button>
                  </Box>
                  <List sx={{ width: '100%' }}>
                    {summary.recentTransactions.length === 0 ? (
                      <ListItem>
                        <ListItemText 
                          primary="🚀 No activity detected" 
                          secondary="Begin your first mission by recording a transaction"
                        />
                      </ListItem>
                    ) : (
                      summary.recentTransactions.slice(0, 5).map((transaction, index) => (
                        <React.Fragment key={transaction.id}>
                          <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: 'rgba(139, 92, 246, 0.2)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                              }}>
                                {getTransactionIcon(transaction.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {transaction.description || transaction.categoryName}
                                  </Typography>
                                  <Typography 
                                    variant="body1" 
                                    fontWeight="bold"
                                    sx={{ 
                                      color: transaction.type === TransactionType.INCOME ? 'success.main' : 'error.main',
                                      textShadow: `0 0 10px ${transaction.type === TransactionType.INCOME ? '#10B981' : '#EF4444'}40`
                                    }}
                                  >
                                    {transaction.type === TransactionType.INCOME ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body2" color="text.secondary">
                                    📍 {transaction.accountName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    🕐 {formatDate(transaction.transactionDate)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < summary.recentTransactions.length - 1 && (
                            <Divider 
                              variant="inset" 
                              component="li" 
                              sx={{ 
                                borderColor: 'rgba(139, 92, 246, 0.2)',
                                boxShadow: '0 1px 3px rgba(139, 92, 246, 0.1)'
                              }} 
                            />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </CommandCenter>
              </SpaceCard>
            </ScrollReveal>
      </Box>
    </DashboardWrapper>
  );
};

export default Dashboard;
