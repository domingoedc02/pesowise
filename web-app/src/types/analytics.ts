export interface SpendingAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categoryBreakdown: CategorySpending[];
  period: string;
}

export interface CategorySpending {
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  color: string;
}

export interface MonthlyTrends {
  trends: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface BudgetAnalytics {
  totalBudgets: number;
  totalBudgetAmount: number;
  totalSpent: number;
  budgetsOnTrack: number;
  budgetsOverBudget: number;
  budgetProgress: BudgetProgress[];
}

export interface BudgetProgress {
  budgetId: number;
  budgetName: string;
  categoryName?: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  daysRemaining: number;
  status: string;
}

export interface GoalAnalytics {
  totalGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalSavedAmount: number;
  averageProgress: number;
  goalProgress: GoalProgress[];
}

export interface GoalProgress {
  goalId: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageComplete: number;
  daysRemaining: number;
  category: string;
  isCompleted: boolean;
}

export interface AccountAnalytics {
  totalBalance: number;
  totalAccounts: number;
  accountBreakdown: AccountBalance[];
}

export interface AccountBalance {
  accountId: number;
  accountName: string;
  accountType: string;
  balance: number;
  percentage: number;
  color: string;
}

export interface FinancialInsights {
  insights: string[];
  spendingChangePercentage: number;
  topSpendingCategory: string;
  recommendedSavings: number;
}

export interface AnalyticsSummary {
  spending: SpendingAnalytics;
  budgets: BudgetAnalytics;
  goals: GoalAnalytics;
  accounts: AccountAnalytics;
  insights: FinancialInsights;
}
