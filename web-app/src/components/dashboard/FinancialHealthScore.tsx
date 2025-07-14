import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
  Star,
  Assessment,
  Savings,
  AccountBalance,
  CreditCard
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { analyticsApi, dashboardApi } from '../../services/api';

const HealthCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.4)'
      : '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

interface HealthMetric {
  name: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  description: string;
  recommendation?: string;
}

interface FinancialHealthData {
  overallScore: number;
  metrics: HealthMetric[];
  trends: {
    month: string;
    score: number;
  }[];
}

const FinancialHealthScore: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<FinancialHealthData | null>(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      // Get analytics data
      const [spendingResponse, trendsResponse, dashboardResponse] = await Promise.all([
        analyticsApi.getSpendingAnalytics(30),
        analyticsApi.getMonthlyTrends(6),
        dashboardApi.getSummary()
      ]);

      const spending = spendingResponse.data;
      const trends = trendsResponse.data.trends;
      const dashboard = dashboardResponse.data;

      // Calculate health metrics
      const metrics: HealthMetric[] = [
        calculateSavingsRate(spending, dashboard),
        calculateEmergencyFund(dashboard),
        calculateDebtToIncome(dashboard),
        calculateBudgetAdherence(dashboard),
        calculateDiversification(spending)
      ];

      // Calculate overall score
      const overallScore = Math.round(
        metrics.reduce((sum, metric) => sum + (metric.score / metric.maxScore), 0) / metrics.length * 100
      );

      // Generate mock trend data
      const trendData = trends.slice(-6).map((trend: any, index: number) => ({
        month: new Date(trend.month).toLocaleDateString('en-US', { month: 'short' }),
        score: Math.max(20, Math.min(100, overallScore + (Math.random() - 0.5) * 20 - index * 2))
      }));

      setHealthData({
        overallScore,
        metrics,
        trends: trendData
      });
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavingsRate = (spending: any, dashboard: any): HealthMetric => {
    const savingsRate = dashboard.monthlyIncome > 0 
      ? ((dashboard.monthlyIncome - dashboard.monthlyExpenses) / dashboard.monthlyIncome) * 100 
      : 0;
    
    let score = 0;
    let status: 'excellent' | 'good' | 'warning' | 'poor' = 'poor';
    
    if (savingsRate >= 20) {
      score = 25;
      status = 'excellent';
    } else if (savingsRate >= 15) {
      score = 20;
      status = 'good';
    } else if (savingsRate >= 10) {
      score = 15;
      status = 'warning';
    } else {
      score = Math.max(0, savingsRate);
      status = 'poor';
    }

    return {
      name: 'Savings Rate',
      score,
      maxScore: 25,
      status,
      description: `${savingsRate.toFixed(1)}% of income saved`,
      recommendation: savingsRate < 20 ? 'Aim to save at least 20% of your income' : undefined
    };
  };

  const calculateEmergencyFund = (dashboard: any): HealthMetric => {
    // Simplified calculation - assumes total balance includes emergency fund
    const monthsOfExpenses = dashboard.monthlyExpenses > 0 
      ? dashboard.totalBalance / dashboard.monthlyExpenses 
      : 0;
    
    let score = 0;
    let status: 'excellent' | 'good' | 'warning' | 'poor' = 'poor';
    
    if (monthsOfExpenses >= 6) {
      score = 25;
      status = 'excellent';
    } else if (monthsOfExpenses >= 3) {
      score = 20;
      status = 'good';
    } else if (monthsOfExpenses >= 1) {
      score = 10;
      status = 'warning';
    } else {
      score = Math.max(0, monthsOfExpenses * 5);
      status = 'poor';
    }

    return {
      name: 'Emergency Fund',
      score,
      maxScore: 25,
      status,
      description: `${monthsOfExpenses.toFixed(1)} months of expenses covered`,
      recommendation: monthsOfExpenses < 6 ? 'Build an emergency fund covering 6 months of expenses' : undefined
    };
  };

  const calculateDebtToIncome = (dashboard: any): HealthMetric => {
    // Simplified - assumes low debt for demo
    const debtRatio = 15; // Mock 15% debt-to-income ratio
    
    let score = 0;
    let status: 'excellent' | 'good' | 'warning' | 'poor' = 'poor';
    
    if (debtRatio <= 10) {
      score = 20;
      status = 'excellent';
    } else if (debtRatio <= 20) {
      score = 15;
      status = 'good';
    } else if (debtRatio <= 36) {
      score = 10;
      status = 'warning';
    } else {
      score = 5;
      status = 'poor';
    }

    return {
      name: 'Debt-to-Income',
      score,
      maxScore: 20,
      status,
      description: `${debtRatio}% of income goes to debt`,
      recommendation: debtRatio > 20 ? 'Consider debt consolidation or payment strategies' : undefined
    };
  };

  const calculateBudgetAdherence = (dashboard: any): HealthMetric => {
    const adherenceRate = 85; // Mock 85% budget adherence
    
    let score = 0;
    let status: 'excellent' | 'good' | 'warning' | 'poor' = 'poor';
    
    if (adherenceRate >= 90) {
      score = 20;
      status = 'excellent';
    } else if (adherenceRate >= 80) {
      score = 15;
      status = 'good';
    } else if (adherenceRate >= 70) {
      score = 10;
      status = 'warning';
    } else {
      score = 5;
      status = 'poor';
    }

    return {
      name: 'Budget Adherence',
      score,
      maxScore: 20,
      status,
      description: `${adherenceRate}% budget adherence rate`,
      recommendation: adherenceRate < 80 ? 'Review and adjust your budget categories' : undefined
    };
  };

  const calculateDiversification = (spending: any): HealthMetric => {
    const categories = spending.categoryBreakdown?.length || 0;
    const diversificationScore = Math.min(100, categories * 20);
    
    let score = 0;
    let status: 'excellent' | 'good' | 'warning' | 'poor' = 'poor';
    
    if (diversificationScore >= 80) {
      score = 10;
      status = 'excellent';
    } else if (diversificationScore >= 60) {
      score = 8;
      status = 'good';
    } else if (diversificationScore >= 40) {
      score = 5;
      status = 'warning';
    } else {
      score = 2;
      status = 'poor';
    }

    return {
      name: 'Spending Diversity',
      score,
      maxScore: 10,
      status,
      description: `${categories} spending categories tracked`,
      recommendation: categories < 5 ? 'Track spending in more categories for better insights' : undefined
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'good':
        return <TrendingUp sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'poor':
        return <Error sx={{ color: theme.palette.error.main }} />;
      default:
        return <Assessment />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <HealthCard>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </HealthCard>
    );
  }

  if (!healthData) {
    return (
      <HealthCard>
        <CardContent>
          <Typography color="error">Failed to load financial health data</Typography>
        </CardContent>
      </HealthCard>
    );
  }

  return (
    <HealthCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Star sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Financial Health Score
            </Typography>
          </Box>
          <Chip
            label={`${healthData.overallScore}/100`}
            sx={{
              backgroundColor: getScoreColor(healthData.overallScore),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Overall Score Display */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center" mb={3}>
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={healthData.overallScore}
                  size={120}
                  thickness={6}
                  sx={{ color: getScoreColor(healthData.overallScore) }}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Typography variant="h4" fontWeight="bold" color={getScoreColor(healthData.overallScore)}>
                    {healthData.overallScore}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Score
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" color="textSecondary" mt={2}>
                {healthData.overallScore >= 80 ? '🎉 Excellent financial health!' :
                 healthData.overallScore >= 60 ? '👍 Good financial health' :
                 healthData.overallScore >= 40 ? '⚠️ Needs improvement' :
                 '🚨 Requires attention'}
              </Typography>
            </Box>
          </Grid>

          {/* Detailed Metrics */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom fontWeight="600">
              Health Breakdown
            </Typography>
            <List dense>
              {healthData.metrics.map((metric, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getStatusIcon(metric.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="500">
                          {metric.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {metric.score}/{metric.maxScore}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={(metric.score / metric.maxScore) * 100}
                          sx={{
                            mt: 0.5,
                            mb: 1,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getScoreColor((metric.score / metric.maxScore) * 100)
                            }
                          }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {metric.description}
                        </Typography>
                        {metric.recommendation && (
                          <Typography variant="caption" display="block" color="warning.main" mt={0.5}>
                            💡 {metric.recommendation}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>

        {/* Quick Tips */}
        <Box mt={3} p={2} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            💼 Quick Tips to Improve Your Score
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Increase your savings rate to 20%+
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Build a 6-month emergency fund
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Keep debt below 20% of income
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Stick to your budget consistently
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </HealthCard>
  );
};

export default FinancialHealthScore;
