import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  MoreVert,
  Visibility,
  Timeline,
  Assessment
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { styled } from '@mui/material/styles';
import { accountApi, analyticsApi } from '../../services/api';

const NetWorthCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
  color: 'white',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
  },
}));

const TrendCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 25px rgba(0, 0, 0, 0.4)'
      : '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyChange: number;
  changePercentage: number;
  historicalData: Array<{
    date: string;
    assets: number;
    liabilities: number;
    netWorth: number;
  }>;
}

interface NetWorthWidgetProps {
  period?: number;
}

const NetWorthWidget: React.FC<NetWorthWidgetProps> = ({ period = 30 }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [netWorthData, setNetWorthData] = useState<NetWorthData | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  useEffect(() => {
    loadNetWorthData();
  }, [period]);

  const loadNetWorthData = async () => {
    try {
      setLoading(true);
      
      // Get current account balances
      const accountsResponse = await accountApi.getAll();
      const accounts = accountsResponse.data;
      
      // Calculate current net worth (simplified - treating all accounts as assets)
      // In a real app, you'd distinguish between asset and liability accounts
      const totalAssets = accounts
        .filter((acc: any) => acc.type !== 'CREDIT_CARD' && acc.balance >= 0)
        .reduce((sum: number, acc: any) => sum + acc.balance, 0);
      
      const totalLiabilities = accounts
        .filter((acc: any) => acc.type === 'CREDIT_CARD' || acc.balance < 0)
        .reduce((sum: number, acc: any) => sum + Math.abs(acc.balance), 0);
      
      const netWorth = totalAssets - totalLiabilities;
      
      // Generate mock historical data (in a real app, this would come from the backend)
      const historicalData = generateMockHistoricalData(netWorth, period);
      
      // Calculate monthly change
      const previousMonth = historicalData[historicalData.length - 2]?.netWorth || netWorth;
      const monthlyChange = netWorth - previousMonth;
      const changePercentage = previousMonth !== 0 ? (monthlyChange / previousMonth) * 100 : 0;
      
      setNetWorthData({
        totalAssets,
        totalLiabilities,
        netWorth,
        monthlyChange,
        changePercentage,
        historicalData
      });
    } catch (error) {
      console.error('Error loading net worth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistoricalData = (currentNetWorth: number, days: number) => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 12))) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic fluctuation (±5% of current net worth)
      const variation = (Math.random() - 0.5) * 0.1 * currentNetWorth;
      const netWorth = currentNetWorth + variation - (days - i) * 100; // Gradual growth trend
      const assets = netWorth * (1.2 + Math.random() * 0.1); // Assets slightly higher than net worth
      const liabilities = assets - netWorth;
      
      data.push({
        date: date.toISOString().split('T')[0],
        assets: Math.max(0, assets),
        liabilities: Math.max(0, liabilities),
        netWorth: netWorth
      });
    }
    
    return data;
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
    if (amount >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
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

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp sx={{ fontSize: 16 }} />;
    if (change < 0) return <TrendingDown sx={{ fontSize: 16 }} />;
    return null;
  };

  if (loading) {
    return (
      <TrendCard>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </TrendCard>
    );
  }

  if (!netWorthData) {
    return (
      <TrendCard>
        <CardContent>
          <Typography color="error">Failed to load net worth data</Typography>
        </CardContent>
      </TrendCard>
    );
  }

  return (
    <Grid container spacing={2}>
      {/* Main Net Worth Card */}
      <Grid item xs={12} md={6}>
        <NetWorthCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box display="flex" alignItems="center">
                <AccountBalance sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" fontWeight="600">
                  Net Worth
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleMenuOpen} sx={{ color: 'white' }}>
                <MoreVert />
              </IconButton>
            </Box>

            <Box mb={3}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {formatCurrency(netWorthData.netWorth)}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1}>
                {getChangeIcon(netWorthData.monthlyChange)}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: getChangeColor(netWorthData.monthlyChange),
                    fontWeight: 600 
                  }}
                >
                  {netWorthData.monthlyChange >= 0 ? '+' : ''}
                  {formatCurrency(netWorthData.monthlyChange)}
                </Typography>
                <Chip
                  label={`${netWorthData.changePercentage >= 0 ? '+' : ''}${netWorthData.changePercentage.toFixed(1)}%`}
                  size="small"
                  sx={{
                    backgroundColor: getChangeColor(netWorthData.changePercentage),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  vs last period
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                    Total Assets
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {formatCompactCurrency(netWorthData.totalAssets)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                    Total Liabilities
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {formatCompactCurrency(netWorthData.totalLiabilities)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </NetWorthCard>
      </Grid>

      {/* Net Worth Trend Chart */}
      <Grid item xs={12} md={6}>
        <TrendCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <Timeline sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Net Worth Trend
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={chartType === 'area' ? 'Area' : 'Line'}
                  size="small"
                  onClick={() => setChartType(chartType === 'area' ? 'line' : 'area')}
                  clickable
                />
              </Box>
            </Box>

            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={netWorthData.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke={theme.palette.text.secondary}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke={theme.palette.text.secondary}
                      tickFormatter={(value) => formatCompactCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={netWorthData.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke={theme.palette.text.secondary}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke={theme.palette.text.secondary}
                      tickFormatter={(value) => formatCompactCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </TrendCard>
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { console.log('View detailed breakdown'); handleMenuClose(); }}>
          <Assessment sx={{ mr: 1 }} />
          View Breakdown
        </MenuItem>
        <MenuItem onClick={() => { console.log('Export data'); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default NetWorthWidget;
