import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
  Grid,
  useTheme,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Savings,
  CreditCard,
  Receipt,
  Star,
  Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { analyticsApi, dashboardApi } from '../../services/api';

const InsightsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
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

const InsightItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface Insight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionSuggestion: string;
  category: 'spending' | 'saving' | 'budgeting' | 'goals' | 'general';
  value?: number;
  isNew: boolean;
}

const SmartInsightsWidget: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadSmartInsights();
  }, []);

  const loadSmartInsights = async () => {
    try {
      setLoading(true);

      // Get financial data for analysis
      const [spendingResponse, dashboardResponse] = await Promise.all([
        analyticsApi.getSpendingAnalytics(30),
        dashboardApi.getSummary()
      ]);

      const spending = spendingResponse.data;
      const dashboard = dashboardResponse.data;

      // Generate smart insights based on data
      const generatedInsights = generateInsights(spending, dashboard);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error loading smart insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (spending: any, dashboard: any): Insight[] => {
    const insights: Insight[] = [];

    // Spending Analysis Insights
    if (spending.categoryBreakdown && spending.categoryBreakdown.length > 0) {
      const topCategory = spending.categoryBreakdown[0];
      const topCategoryPercentage = (topCategory.amount / spending.totalAmount) * 100;

      if (topCategoryPercentage > 40) {
        insights.push({
          id: 'high-category-spending',
          type: 'warning',
          priority: 'high',
          title: `High ${topCategory.categoryName} Spending`,
          description: `${topCategory.categoryName} represents ${topCategoryPercentage.toFixed(1)}% of your total spending this month.`,
          impact: 'This concentration could limit your financial flexibility.',
          actionSuggestion: `Consider diversifying your spending or setting a specific budget for ${topCategory.categoryName}.`,
          category: 'spending',
          value: topCategory.amount,
          isNew: true
        });
      }
    }

    // Savings Rate Insights
    const savingsRate = dashboard.monthlyIncome > 0 
      ? ((dashboard.monthlyIncome - dashboard.monthlyExpenses) / dashboard.monthlyIncome) * 100 
      : 0;

    if (savingsRate < 10) {
      insights.push({
        id: 'low-savings-rate',
        type: 'warning',
        priority: 'high',
        title: 'Low Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%, which is below the recommended 20%.`,
        impact: 'This may affect your long-term financial security and emergency preparedness.',
        actionSuggestion: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
        category: 'saving',
        value: savingsRate,
        isNew: false
      });
    } else if (savingsRate >= 20) {
      insights.push({
        id: 'excellent-savings',
        type: 'achievement',
        priority: 'medium',
        title: 'Excellent Savings Rate!',
        description: `Your savings rate of ${savingsRate.toFixed(1)}% exceeds the recommended 20%.`,
        impact: 'You\'re building strong financial security for your future.',
        actionSuggestion: 'Consider investing your excess savings for potential growth.',
        category: 'saving',
        value: savingsRate,
        isNew: true
      });
    }

    // Emergency Fund Insight
    const monthsOfExpenses = dashboard.monthlyExpenses > 0 
      ? dashboard.totalBalance / dashboard.monthlyExpenses 
      : 0;

    if (monthsOfExpenses < 3) {
      insights.push({
        id: 'emergency-fund-low',
        type: 'opportunity',
        priority: 'high',
        title: 'Build Your Emergency Fund',
        description: `Your current balance covers ${monthsOfExpenses.toFixed(1)} months of expenses.`,
        impact: 'Financial experts recommend 3-6 months of expenses for emergencies.',
        actionSuggestion: 'Aim to save ₱' + (dashboard.monthlyExpenses * 3 - dashboard.totalBalance).toLocaleString() + ' more for a 3-month emergency fund.',
        category: 'saving',
        value: monthsOfExpenses,
        isNew: false
      });
    }

    // Goals Progress Insight
    if (dashboard.activeGoals > 0) {
      const completionRate = dashboard.completedGoals / (dashboard.activeGoals + dashboard.completedGoals) * 100;
      
      if (completionRate < 30) {
        insights.push({
          id: 'goal-completion-low',
          type: 'opportunity',
          priority: 'medium',
          title: 'Boost Your Goal Achievement',
          description: `You've completed ${completionRate.toFixed(0)}% of your financial goals.`,
          impact: 'Setting and achieving financial goals is crucial for long-term success.',
          actionSuggestion: 'Break down large goals into smaller, manageable milestones.',
          category: 'goals',
          value: completionRate,
          isNew: false
        });
      }
    }

    // Spending Trend Insight
    const recentSpending = dashboard.monthlyExpenses;
    const avgMonthlySpending = recentSpending; // Simplified for demo
    
    if (recentSpending > avgMonthlySpending * 1.2) {
      insights.push({
        id: 'spending-spike',
        type: 'warning',
        priority: 'medium',
        title: 'Spending Spike Detected',
        description: 'Your spending this month is 20% higher than usual.',
        impact: 'This could impact your savings goals and budget adherence.',
        actionSuggestion: 'Review your recent transactions to identify the cause and adjust if needed.',
        category: 'spending',
        value: recentSpending,
        isNew: true
      });
    }

    // Budget Adherence Insight
    if (dashboard.activeBudgets > 0) {
      const budgetAdherence = 85; // Mock data
      
      if (budgetAdherence < 80) {
        insights.push({
          id: 'budget-adherence',
          type: 'tip',
          priority: 'medium',
          title: 'Improve Budget Adherence',
          description: `You're following your budgets ${budgetAdherence}% of the time.`,
          impact: 'Better budget adherence leads to improved financial control.',
          actionSuggestion: 'Set up spending alerts when you\'re close to budget limits.',
          category: 'budgeting',
          value: budgetAdherence,
          isNew: false
        });
      }
    }

    // General Financial Tips
    insights.push({
      id: 'automation-tip',
      type: 'tip',
      priority: 'low',
      title: 'Automate Your Savings',
      description: 'Set up automatic transfers to your savings account.',
      impact: 'Automation helps you save consistently without thinking about it.',
      actionSuggestion: 'Start with just ₱1,000 per month and gradually increase.',
      category: 'general',
      isNew: false
    });

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'opportunity':
        return <TrendingUp sx={{ color: theme.palette.info.main }} />;
      case 'achievement':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'tip':
        return <Lightbulb sx={{ color: theme.palette.secondary.main }} />;
      default:
        return <Star sx={{ color: theme.palette.primary.main }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const filteredInsights = insights.filter(insight => 
    filter === 'all' || insight.priority === filter
  );

  const newInsightsCount = insights.filter(insight => insight.isNew).length;

  if (loading) {
    return (
      <InsightsCard>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </InsightsCard>
    );
  }

  return (
    <InsightsCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Lightbulb sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Smart Financial Insights
            </Typography>
            {newInsightsCount > 0 && (
              <Badge badgeContent={newInsightsCount} color="error" sx={{ ml: 1 }}>
                <Chip size="small" label="New" color="primary" />
              </Badge>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              size="small"
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              size="small"
              variant={filter === 'high' ? 'contained' : 'outlined'}
              onClick={() => setFilter('high')}
              color="error"
            >
              High
            </Button>
            <Button
              size="small"
              variant={filter === 'medium' ? 'contained' : 'outlined'}
              onClick={() => setFilter('medium')}
              color="warning"
            >
              Medium
            </Button>
            <Button
              size="small"
              variant={filter === 'low' ? 'contained' : 'outlined'}
              onClick={() => setFilter('low')}
              color="info"
            >
              Low
            </Button>
            <IconButton size="small" onClick={loadSmartInsights}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {filteredInsights.length === 0 ? (
          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="body1" fontWeight="500">
              Great job! No high-priority financial insights at the moment.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your financial habits are on track. Keep up the good work!
            </Typography>
          </Alert>
        ) : (
          <List sx={{ width: '100%' }}>
            {filteredInsights.map((insight, index) => (
              <InsightItem key={insight.id} elevation={1}>
                <ListItem
                  onClick={() => setExpandedInsight(
                    expandedInsight === insight.id ? null : insight.id
                  )}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    {getInsightIcon(insight.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="500">
                            {insight.title}
                          </Typography>
                          {insight.isNew && (
                            <Chip size="small" label="New" color="primary" variant="outlined" />
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            size="small"
                            label={insight.priority.toUpperCase()}
                            sx={{
                              backgroundColor: getPriorityColor(insight.priority),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          {expandedInsight === insight.id ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      </Box>
                    }
                    secondary={insight.description}
                  />
                </ListItem>
                <Collapse in={expandedInsight === insight.id} timeout="auto" unmountOnExit>
                  <Box p={2} pt={0}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          💡 Impact
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {insight.impact}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          🎯 Suggested Action
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {insight.actionSuggestion}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box mt={2} display="flex" gap={1}>
                      <Button size="small" variant="outlined" color="primary">
                        Take Action
                      </Button>
                      <Button size="small" variant="text" color="secondary">
                        Remind Me Later
                      </Button>
                      <Button size="small" variant="text" color="error">
                        Dismiss
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </InsightItem>
            ))}
          </List>
        )}

        <Box mt={3} p={2} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            💼 Pro Tips for Better Financial Health
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Review your spending weekly
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Set specific, measurable goals
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Automate your savings
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                • Track your net worth monthly
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </InsightsCard>
  );
};

export default SmartInsightsWidget;
