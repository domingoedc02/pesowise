import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  useTheme,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  ShowChart,
  BarChart as BarChartIcon,
  Download,
  Visibility,
  CalendarToday,
  Category
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { styled } from '@mui/material/styles';
import { analyticsApi } from '../../services/api';

const TrendsCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
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

interface SpendingTrendData {
  month: string;
  totalSpending: number;
  categories: {
    [key: string]: number;
  };
  weeklyAverage: number;
  monthlyChange: number;
}

interface CategoryTrend {
  name: string;
  current: number;
  previous: number;
  change: number;
  color: string;
}

interface SpendingTrendsProps {
  period?: number;
}

const SpendingTrendsWidget: React.FC<SpendingTrendsProps> = ({ period = 6 }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<SpendingTrendData[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [showProjection, setShowProjection] = useState(false);

  useEffect(() => {
    loadSpendingTrends();
  }, [period]);

  const loadSpendingTrends = async () => {
    try {
      setLoading(true);

      // Get spending analytics and trends
      const [spendingResponse, trendsResponse] = await Promise.all([
        analyticsApi.getSpendingAnalytics(period * 30), // Convert to days
        analyticsApi.getMonthlyTrends(period)
      ]);

      const spending = spendingResponse.data;
      const trends = trendsResponse.data.trends;

      // Process trend data
      const processedTrends: SpendingTrendData[] = trends.map((trend: any, index: number) => {
        const monthDate = new Date(trend.month);
        const monthName = monthDate.toLocaleDateString('en-US', { 
          month: 'short',
          year: monthDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
        });

        // Generate mock category breakdown for each month
        const categories: { [key: string]: number } = {};
        spending.categoryBreakdown?.forEach((cat: any, catIndex: number) => {
          const variation = 0.8 + (Math.random() * 0.4); // 80-120% variation
          categories[cat.categoryName] = (cat.amount / period) * variation;
        });

        return {
          month: monthName,
          totalSpending: trend.expenses,
          categories,
          weeklyAverage: trend.expenses / 4.33, // Approximate weeks per month
          monthlyChange: index > 0 ? ((trend.expenses - trends[index - 1].expenses) / trends[index - 1].expenses) * 100 : 0
        };
      });

      // Calculate category trends
      const categoryTrendData: CategoryTrend[] = spending.categoryBreakdown?.map((category: any, index: number) => {
        const currentMonth = processedTrends[processedTrends.length - 1];
        const previousMonth = processedTrends[processedTrends.length - 2];
        
        const current = currentMonth?.categories[category.categoryName] || 0;
        const previous = previousMonth?.categories[category.categoryName] || 0;
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        return {
          name: category.categoryName,
          current,
          previous,
          change,
          color: category.color || theme.palette.primary.main
        };
      }) || [];

      setTrendData(processedTrends);
      setCategoryTrends(categoryTrendData.slice(0, 6)); // Top 6 categories
    } catch (error) {
      console.error('Error loading spending trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `₱${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return theme.palette.error.main;
    if (change < -5) return theme.palette.success.main;
    return theme.palette.warning.main;
  };

  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp sx={{ fontSize: 16, color: theme.palette.error.main }} /> : 
      <TrendingDown sx={{ fontSize: 16, color: theme.palette.success.main }} />;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight="bold">
            Total: {formatCurrency(data.totalSpending)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Weekly Avg: {formatCurrency(data.weeklyAverage)}
          </Typography>
          {data.monthlyChange !== 0 && (
            <Typography 
              variant="caption" 
              color={data.monthlyChange >= 0 ? "error.main" : "success.main"}
              display="flex"
              alignItems="center"
              gap={0.5}
            >
              {getTrendIcon(data.monthlyChange)}
              {Math.abs(data.monthlyChange).toFixed(1)}% vs prev month
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalSpending" 
              name="Total Spending"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="weeklyAverage" 
              name="Weekly Average"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalSpending"
              name="Total Spending"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="totalSpending" 
              name="Total Spending"
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      default:
        return (
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalSpending"
              name="Total Spending"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.3}
            />
          </AreaChart>
        );
    }
  };

  if (loading) {
    return (
      <TrendsCard>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </TrendsCard>
    );
  }

  return (
    <TrendsCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <ShowChart sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Spending Trends Analysis
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              size="small"
              variant={chartType === 'line' ? 'contained' : 'outlined'}
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              size="small"
              variant={chartType === 'area' ? 'contained' : 'outlined'}
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
            <Button
              size="small"
              variant={chartType === 'bar' ? 'contained' : 'outlined'}
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {formatCompactCurrency(trendData.reduce((sum, data) => sum + data.totalSpending, 0))}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Period
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="secondary.main" fontWeight="bold">
                {trendData.length > 0 ? formatCompactCurrency(trendData.reduce((sum, data) => sum + data.totalSpending, 0) / trendData.length) : '₱0'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Monthly Average
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="info.main" fontWeight="bold">
                {trendData.length > 0 ? formatCompactCurrency(trendData[trendData.length - 1]?.weeklyAverage || 0) : '₱0'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Current Weekly Avg
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={0.5}>
              {trendData.length > 0 && getTrendIcon(trendData[trendData.length - 1]?.monthlyChange || 0)}
              <Typography 
                variant="h6" 
                fontWeight="bold"
                color={getTrendColor(trendData[trendData.length - 1]?.monthlyChange || 0)}
              >
                {trendData.length > 0 ? `${Math.abs(trendData[trendData.length - 1]?.monthlyChange || 0).toFixed(1)}%` : '0%'}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary">
              Monthly Change
            </Typography>
          </Grid>
        </Grid>

        {/* Chart */}
        <Box height={350} mb={3}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>

        {/* Category Trends */}
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight="600" display="flex" alignItems="center" gap={1}>
            <Category sx={{ fontSize: 20 }} />
            Category Trends
          </Typography>
          <Grid container spacing={2}>
            {categoryTrends.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box 
                  p={2} 
                  borderRadius={1} 
                  bgcolor="action.hover"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                      }}
                    />
                    <Typography variant="body2" fontWeight="500">
                      {category.name}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatCompactCurrency(category.current)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {getTrendIcon(category.change)}
                      <Typography 
                        variant="caption" 
                        color={getTrendColor(category.change)}
                      >
                        {Math.abs(category.change).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Controls */}
        <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showProjection}
                onChange={(e) => setShowProjection(e.target.checked)}
                size="small"
              />
            }
            label="Show Projection"
          />
          <Typography variant="caption" color="textSecondary">
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { console.log('Export trends'); handleMenuClose(); }}>
          <Download sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
        <MenuItem onClick={() => { console.log('View details'); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { console.log('Schedule report'); handleMenuClose(); }}>
          <CalendarToday sx={{ mr: 1 }} />
          Schedule Report
        </MenuItem>
      </Menu>
    </TrendsCard>
  );
};

export default SpendingTrendsWidget;
