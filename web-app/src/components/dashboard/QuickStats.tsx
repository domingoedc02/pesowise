import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Savings,
  TrackChanges,
  EmojiEvents,
  NotificationsActive,
} from '@mui/icons-material';
import { DashboardSummary } from '../../types/financial';

const StatsCard = styled(Card)(({ theme }) => ({
  background: theme.space?.gradients?.galaxy || (theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'),
  border: `1px solid ${theme.space?.colors?.stellar || theme.palette.divider}`,
  borderRadius: theme.enterprise?.borderRadius?.medium || theme.spacing(1.5),
  boxShadow: theme.enterprise?.shadows?.cosmic || theme.shadows[1],
  transition: 'all 0.2s ease',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: theme.space?.gradients?.galaxy || (theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)'),
    transform: 'translateY(-1px)',
    boxShadow: theme.enterprise?.shadows?.nebula || theme.shadows[4],
  },
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

interface QuickStatsProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({ summary, loading }) => {
  const theme = useTheme();

  if (loading || !summary) {
    return (
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((index) => (
            <Grid item xs={6} md={3} key={index}>
              <StatsCard>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="50%" height={32} />
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const getBudgetStatus = () => {
    // Mock budget status calculation - in real implementation, this would come from API
    const totalBudgets = summary.activeBudgets || 5;
    const onTrackBudgets = Math.floor(totalBudgets * 0.6); // 60% on track
    return { onTrack: onTrackBudgets, total: totalBudgets };
  };

  const getGoalStatus = () => {
    const totalGoals = summary.activeGoals + summary.completedGoals;
    return { completed: summary.completedGoals, total: totalGoals };
  };

  const getAlertCount = () => {
    // Mock alert count - in real implementation, this would come from API
    return 1; // Example: 1 budget alert
  };

  const budgetStatus = getBudgetStatus();
  const goalStatus = getGoalStatus();
  const alertCount = getAlertCount();

  const stats = [
    {
      title: '💰 Energy Conservation',
      subtitle: 'Savings Rate',
      value: `${summary.savingsRate.toFixed(1)}%`,
      icon: <Savings />,
      color: summary.savingsRate >= 20 ? theme.palette.success.main : 
             summary.savingsRate >= 10 ? theme.palette.warning.main : theme.palette.error.main,
      status: summary.savingsRate >= 20 ? 'Excellent' : 
                summary.savingsRate >= 10 ? 'Good' : 'Needs Improvement',
      emoji: '💰'
    },
    {
      title: '📊 System Resources',
      subtitle: 'Budget Status',
      value: `${budgetStatus.onTrack}/${budgetStatus.total}`,
      icon: <TrackChanges />,
      color: budgetStatus.onTrack / budgetStatus.total >= 0.8 ? theme.palette.success.main : 
             budgetStatus.onTrack / budgetStatus.total >= 0.6 ? theme.palette.warning.main : theme.palette.error.main,
      status: 'On Track',
      emoji: '📊'
    },
    {
      title: '🎯 Mission Progress',
      subtitle: 'Goals Progress',
      value: `${goalStatus.completed}/${goalStatus.total}`,
      icon: <EmojiEvents />,
      color: theme.palette.primary.main,
      status: 'Completed',
      emoji: '🎯'
    },
    {
      title: '⚠️ System Alerts',
      subtitle: 'Alerts',
      value: alertCount.toString(),
      icon: <NotificationsActive />,
      color: alertCount === 0 ? theme.palette.success.main : 
             alertCount <= 2 ? theme.palette.warning.main : theme.palette.error.main,
      status: alertCount === 0 ? 'All Clear' : 
                alertCount === 1 ? 'Active Alert' : 'Active Alerts',
      emoji: '⚠️'
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <StatsCard>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box
                    sx={{
                      color: stat.color,
                      mr: 1,
                      display: 'flex',
                      alignItems: 'center',
                      p: 0.5,
                      borderRadius: 1,
                      backgroundColor: `${stat.color}15`,
                      boxShadow: `0 0 10px ${stat.color}30`,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.primary" fontSize="0.875rem" fontWeight={600}>
                      {stat.title}
                    </Typography>
                    {stat.subtitle && (
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        {stat.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography
                    variant="h6"
                    sx={{
                      color: stat.color,
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  
                  <Chip
                    label={stat.status}
                    size="small"
                    sx={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24,
                      boxShadow: `0 0 10px ${stat.color}20`,
                    }}
                  />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickStats;
