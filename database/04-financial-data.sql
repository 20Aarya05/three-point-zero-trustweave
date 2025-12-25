-- =====================================================
-- TrustWeave Financial Data - Part 4
-- =====================================================

-- Loan experience (Step 3: Loan Experience)
CREATE TABLE IF NOT EXISTS loan_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Loan history
    experience_level VARCHAR(50) NOT NULL,
    previous_loans_count INTEGER DEFAULT 0,
    total_borrowed_amount DECIMAL(12,2),
    
    -- Loan details
    loan_types TEXT[], -- ['personal', 'business', 'education', 'vehicle', 'home']
    repayment_history VARCHAR(100),
    defaults_count INTEGER DEFAULT 0,
    current_outstanding DECIMAL(12,2),
    
    -- Lender relationships
    formal_lenders TEXT[], -- Banks, NBFCs
    informal_lenders TEXT[], -- Friends, family, money lenders
    
    -- Experience narrative
    experience_description TEXT,
    lessons_learned TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial capacity (Step 4: Financial Capacity)
CREATE TABLE IF NOT EXISTS financial_capacity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Employment information
    employment_type VARCHAR(50) NOT NULL,
    income_range VARCHAR(50) NOT NULL,
    income_stability VARCHAR(50) NOT NULL,
    
    -- Detailed financial info
    employer_name VARCHAR(255),
    job_title VARCHAR(255),
    years_employed DECIMAL(3,1),
    industry VARCHAR(100),
    
    -- Income breakdown
    primary_income DECIMAL(10,2),
    secondary_income DECIMAL(10,2),
    irregular_income DECIMAL(10,2),
    
    -- Expenses
    monthly_expenses DECIMAL(10,2),
    fixed_expenses DECIMAL(10,2),
    variable_expenses DECIMAL(10,2),
    
    -- Financial ratios
    debt_to_income_ratio DECIMAL(5,4),
    savings_rate DECIMAL(5,4),
    expense_ratio DECIMAL(5,4),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset support (Step 5: Asset Support)
CREATE TABLE IF NOT EXISTS asset_support (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Asset ownership
    property BOOLEAN DEFAULT false,
    fixed_deposits BOOLEAN DEFAULT false,
    collateral_willingness BOOLEAN DEFAULT false,
    
    -- Detailed asset information
    property_details JSONB, -- {type, value, location, ownership_type}
    fd_details JSONB, -- {bank, amount, maturity_date, interest_rate}
    other_assets JSONB, -- {vehicles, jewelry, investments, etc.}
    
    -- Asset values
    total_asset_value DECIMAL(12,2),
    liquid_assets DECIMAL(12,2),
    illiquid_assets DECIMAL(12,2),
    
    -- Collateral information
    collateral_types TEXT[],
    collateral_value DECIMAL(12,2),
    collateral_documentation BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);