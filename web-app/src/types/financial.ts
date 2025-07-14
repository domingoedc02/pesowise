// Account types
export enum AccountType {
  BANK = 'BANK',
  CASH = 'CASH',
  E_WALLET = 'E_WALLET',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT'
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  initialBalance: number;
  currency: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}

export interface AccountBalance {
  accountId: number;
  accountName: string;
  balance: number;
  currency: string;
}

// Category types
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  parentId?: number;
  parentName?: string;
  isSystem: boolean;
  isActive: boolean;
  subCategories?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  parentId?: number;
}

// Transaction types
export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: string;
  fromAccountId?: number;
  fromAccountName?: string;
  toAccountId?: number;
  toAccountName?: string;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface CreateTransactionRequest {
  accountId: number;
  categoryId: number;
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: string;
  toAccountId?: number;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
}

export interface UpdateTransactionRequest {
  categoryId?: number;
  amount?: number;
  description?: string;
  transactionDate?: string;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
}

export interface CategoryBreakdown {
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

// Budget types
export enum BudgetPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Budget {
  id: number;
  name: string;
  categoryId?: number;
  categoryName?: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notifyPercentage: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface CreateBudgetRequest {
  name: string;
  categoryId?: number;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  notifyPercentage: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  notifyPercentage?: number;
  endDate?: string;
  isActive?: boolean;
}

export interface BudgetProgress {
  budget: Budget;
  transactions: Transaction[];
  categoryBreakdown?: CategoryBreakdown[];
}

// Goal types
export enum GoalCategory {
  EMERGENCY_FUND = 'EMERGENCY_FUND',
  VACATION = 'VACATION',
  HOME = 'HOME',
  VEHICLE = 'VEHICLE',
  EDUCATION = 'EDUCATION',
  RETIREMENT = 'RETIREMENT',
  INVESTMENT = 'INVESTMENT',
  OTHER = 'OTHER'
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: GoalCategory;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  percentageComplete: number;
  daysRemaining?: number;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  targetDate: string;
  category: GoalCategory;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export interface GoalContribution {
  id: number;
  goalId: number;
  goalName: string;
  accountId: number;
  accountName: string;
  amount: number;
  contributionDate: string;
  notes?: string;
}

export interface CreateGoalContributionRequest {
  accountId: number;
  amount: number;
  contributionDate: string;
  notes?: string;
}

export interface GoalProgress {
  goal: Goal;
  contributions: GoalContribution[];
  monthlyContributionNeeded?: number;
}

// Notification types
export enum NotificationType {
  BUDGET_ALERT = 'BUDGET_ALERT',
  GOAL_MILESTONE = 'GOAL_MILESTONE',
  BILL_REMINDER = 'BILL_REMINDER',
  LOW_BALANCE = 'LOW_BALANCE',
  UNUSUAL_SPENDING = 'UNUSUAL_SPENDING',
  SYSTEM = 'SYSTEM'
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Dashboard types
export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  activeGoals: number;
  completedGoals: number;
  activeBudgets: number;
  recentTransactions: Transaction[];
}

// Pagination types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
}

// Common types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface MonthYear {
  month: number;
  year: number;
}
