import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  Receipt,
  Savings,
} from "@mui/icons-material";
import { DashboardSummary } from "../../types/financial";
import { PanelsTopLeft } from "lucide-react";

const MetricCard = styled(Card)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #1e1e1e, #2d2d2d)"
      : "linear-gradient(145deg, #ffffff, #f5f5f5)",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  transition: "all 0.3s ease",
  height: "100%",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[8],
  },
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: "2.5rem",
  fontWeight: 700,
  lineHeight: 1.2,
  [theme.breakpoints.down("sm")]: {
    fontSize: "2rem",
  },
}));

const TrendIndicator = styled(Box)<{ trend: "up" | "down" | "neutral" }>(
  ({ theme, trend }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    color:
      trend === "up"
        ? theme.palette.success.main
        : trend === "down"
        ? theme.palette.error.main
        : theme.palette.text.secondary,
  })
);

interface FinancialOverviewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  period: number;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  summary,
  loading,
  period,
}) => {
  const theme = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTrend = (
    current: number,
    previous: number
  ): { percentage: number; direction: "up" | "down" | "neutral" } => {
    if (previous === 0) return { percentage: 0, direction: "neutral" };
    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(percentage),
      direction: percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral",
    };
  };

  // Mock trend data - in real implementation, this would come from API
  const getTrendData = (type: string) => {
    const mockTrends = {
      income: { percentage: 5.2, direction: "up" as const },
      expenses: { percentage: 2.1, direction: "down" as const },
      netFlow: { percentage: 12.3, direction: "up" as const },
      balance: { percentage: 8.7, direction: "up" as const },
    };
    return (
      mockTrends[type as keyof typeof mockTrends] || {
        percentage: 0,
        direction: "neutral" as const,
      }
    );
  };

  if (loading || !summary) {
    return (
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center">
          <PanelsTopLeft
            size={32}
            style={{ marginRight: 16, color: "#8B5CF6" }}
          />
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{
              color: "primary.main",
              textShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
            }}
          >
            Financial Overview
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <MetricCard>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ mb: 2 }}
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={32}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={48}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="40%" height={24} />
                </CardContent>
              </MetricCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const netCashFlow = summary.monthlyIncome - summary.monthlyExpenses;
  const netFlowTrend = getTrendData("netFlow");

  const metrics = [
    {
      title: "Monthly Income",
      value: summary.monthlyIncome,
      icon: <AttachMoney />,
      color: theme.palette.success.main,
      trend: getTrendData("income"),
    },
    {
      title: "Monthly Expenses",
      value: summary.monthlyExpenses,
      icon: <Receipt />,
      color: theme.palette.error.main,
      trend: getTrendData("expenses"),
    },
    {
      title: "Net Cash Flow",
      value: netCashFlow,
      icon: <Savings />,
      color:
        netCashFlow >= 0
          ? theme.palette.success.main
          : theme.palette.error.main,
      trend: netFlowTrend,
    },
    {
      title: "Total Balance",
      value: summary.totalBalance,
      icon: <AccountBalance />,
      color: theme.palette.primary.main,
      trend: getTrendData("balance"),
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" alignItems="center">
        <PanelsTopLeft
          size={32}
          style={{ marginRight: 16, color: "#8B5CF6" }}
        />
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            color: "primary.main",
            textShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
          }}
        >
          Financial Overview
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <MetricCard>
              <CardContent sx={{ p: 3 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: `${metric.color}15`,
                      color: metric.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontWeight: 500 }}
                >
                  {metric.title}
                </Typography>

                <MetricValue sx={{ color: metric.color, mb: 1 }}>
                  {metric.title === "Net Cash Flow" && netCashFlow < 0
                    ? "-"
                    : ""}
                  {formatCurrency(Math.abs(metric.value))}
                </MetricValue>

                <TrendIndicator trend={metric.trend.direction}>
                  {metric.trend.direction === "up" ? (
                    <TrendingUp fontSize="small" />
                  ) : metric.trend.direction === "down" ? (
                    <TrendingDown fontSize="small" />
                  ) : null}
                  <Typography variant="caption" fontWeight={600}>
                    {metric.trend.percentage > 0 &&
                      `${
                        metric.trend.direction === "up" ? "+" : "-"
                      }${metric.trend.percentage.toFixed(1)}%`}
                    {metric.trend.percentage === 0 && "No change"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    vs last {period} days
                  </Typography>
                </TrendIndicator>
              </CardContent>
            </MetricCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FinancialOverview;
