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
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  ShowChart,
  BarChart as BarChartIcon,
  Download,
  Visibility
} from '@mui/icons-material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { styled } from '@mui/material/styles';
import { analyticsApi } from '../../services/api';

const ChartCard = styled(Card)(({ theme }) => ({
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

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
  cumulativeFlow: number;
}

interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  bestMonth: string;
  worstMonth: string;
}

interface CashFlowChartProps {
  period?: number;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ period = 6 }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState<'composed' | 'area'>('composed');

  useEffect(() => {
    loadCashFlowData();
  }, [period]);

  const loadCashFlowData = async () => {
    try {
      setLoading(true);

      // Get monthly trends data
      const trendsResponse = await analyticsApi.getMonthlyTrends(period);
      const trends = trendsResponse.data.trends;

      let cumulativeFlow = 0;
      const processedData: CashFlowData[] = trends.map((trend: any) => {
        const netFlow = trend.income - trend.expenses;
        cumulativeFlow += netFlow;

        return {
          month: new Date(trend.month).toLocaleDateString('en-US', { 
            month: 'short', 
            year: new Date(trend.month).getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined 
          }),
          income: trend.income,
          expenses: trend.expenses,
          netFlow: netFlow,
          cumulativeFlow: cumulativeFlow
        };
      });

      // Calculate summary statistics
      const totalIncome = processedData.reduce((sum, data) => sum + data.income, 0);
      const totalExpenses = processedData.reduce((sum, data) => sum + data.expenses, 0);
      const netCashFlow = totalIncome - totalExpenses;

      const bestMonthData = processedData.reduce((best, current) => 
        current.netFlow > best.netFlow ? current : best
      );
      const worstMonthData = processedData.reduce((worst, current) => 
        current.netFlow < worst.netFlow ? current : worst
      );

      const summaryData: CashFlowSummary = {
        totalIncome,
        totalExpenses,
        netCashFlow,
        averageMonthlyIncome: totalIncome / processedData.length,
        averageMonthlyExpenses: totalExpenses / processedData.length,
        bestMonth: bestMonthData.month,
        worstMonth: worstMonthData.month
      };

      setCashFlowData(processedData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading cash flow data:', error);
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

  const getNetFlowColor = (netFlow: number) => {
    return netFlow >= 0 ? theme.palette.success.main : theme.palette.error.main;
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
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: theme.palette.success.main,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2">
                Income: {formatCurrency(data.income)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: theme.palette.error.main,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2">
                Expenses: {formatCurrency(data.expenses)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: getNetFlowColor(data.netFlow),
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2" fontWeight="bold">
                Net Flow: {formatCurrency(data.netFlow)}
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <ChartCard>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </ChartCard>
    );
  }

  return (
    <ChartCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <ShowChart sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Cash Flow Analysis
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={chartType === 'composed' ? 'Composed' : 'Area'}
              size="small"
              onClick={() => setChartType(chartType === 'composed' ? 'area' : 'composed')}
              clickable
              icon={chartType === 'composed' ? <BarChartIcon /> : <ShowChart />}
            />
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Summary Stats */}
        {summary && (
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {formatCompactCurrency(summary.totalIncome)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Income
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  {formatCompactCurrency(summary.totalExpenses)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Expenses
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography 
                  variant="h6" 
                  color={getNetFlowColor(summary.netCashFlow)}
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={0.5}
                >
                  {summary.netCashFlow >= 0 ? <TrendingUp sx={{ fontSize: 20 }} /> : <TrendingDown sx={{ fontSize: 20 }} />}
                  {formatCompactCurrency(summary.netCashFlow)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Net Cash Flow
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {formatCompactCurrency(summary.averageMonthlyIncome)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Monthly Income
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Chart */}
        <Box height={350}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'composed' ? (
              <ComposedChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  dataKey="income" 
                  name="Income"
                  fill={theme.palette.success.main}
                  fillOpacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expenses" 
                  name="Expenses"
                  fill={theme.palette.error.main}
                  fillOpacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeFlow" 
                  name="Cumulative Flow"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            ) : (
              <AreaChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  dataKey="income"
                  stackId="1"
                  name="Income"
                  stroke={theme.palette.success.main}
                  fill={theme.palette.success.main}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  name="Expenses"
                  stroke={theme.palette.error.main}
                  fill={theme.palette.error.main}
                  fillOpacity={0.6}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Box>

        {/* Insights */}
        {summary && (
          <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              💡 Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Best Month:</strong> {summary.bestMonth}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Worst Month:</strong> {summary.worstMonth}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { console.log('Export chart'); handleMenuClose(); }}>
          <Download sx={{ mr: 1 }} />
          Export Chart
        </MenuItem>
        <MenuItem onClick={() => { console.log('View details'); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      </Menu>
    </ChartCard>
  );
};

export default CashFlowChart;
