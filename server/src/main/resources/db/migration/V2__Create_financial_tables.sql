-- Create accounts table
CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- BANK, CASH, CREDIT_CARD, E_WALLET, INVESTMENT
    currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color
    is_active BOOLEAN DEFAULT TRUE,
    is_included_in_total BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color
    is_system BOOLEAN DEFAULT FALSE, -- System categories cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,
    parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE, TRANSFER
    description TEXT,
    transaction_date DATE NOT NULL,
    from_account_id BIGINT REFERENCES accounts(id), -- For transfers
    to_account_id BIGINT REFERENCES accounts(id), -- For transfers
    tags TEXT[], -- Array of tags
    location VARCHAR(255),
    receipt_url VARCHAR(500),
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create budgets table
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(20) NOT NULL, -- WEEKLY, MONTHLY, YEARLY
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notify_percentage INTEGER DEFAULT 80, -- Notify when X% of budget is used
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create goals table
CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    target_date DATE NOT NULL,
    category VARCHAR(50), -- EMERGENCY, VACATION, PURCHASE, INVESTMENT, OTHER
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create goal_contributions table
CREATE TABLE goal_contributions (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES accounts(id),
    amount DECIMAL(15, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create recurring_transactions table
CREATE TABLE recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES accounts(id),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE
    description TEXT,
    frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    frequency_interval INTEGER DEFAULT 1, -- Every X days/weeks/months/years
    start_date DATE NOT NULL,
    end_date DATE,
    last_processed_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- BUDGET_ALERT, GOAL_MILESTONE, TRANSACTION_REMINDER, SYSTEM
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Insert default system categories
INSERT INTO categories (name, type, icon, color, is_system, is_active) VALUES
-- Income categories
('Salary', 'INCOME', 'Work', '#4CAF50', true, true),
('Freelance', 'INCOME', 'Briefcase', '#8BC34A', true, true),
('Investment', 'INCOME', 'TrendingUp', '#00BCD4', true, true),
('Business', 'INCOME', 'Store', '#009688', true, true),
('Other Income', 'INCOME', 'Plus', '#2196F3', true, true),

-- Expense categories
('Food & Dining', 'EXPENSE', 'Utensils', '#FF5722', true, true),
('Transportation', 'EXPENSE', 'Car', '#795548', true, true),
('Shopping', 'EXPENSE', 'ShoppingBag', '#E91E63', true, true),
('Entertainment', 'EXPENSE', 'Film', '#9C27B0', true, true),
('Bills & Utilities', 'EXPENSE', 'FileText', '#F44336', true, true),
('Healthcare', 'EXPENSE', 'Heart', '#FF9800', true, true),
('Education', 'EXPENSE', 'BookOpen', '#3F51B5', true, true),
('Home', 'EXPENSE', 'Home', '#607D8B', true, true),
('Personal', 'EXPENSE', 'User', '#FFC107', true, true),
('Other Expense', 'EXPENSE', 'MoreHorizontal', '#9E9E9E', true, true);
