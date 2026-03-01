-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (linked to Telegram ID)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    wallet_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties Table representing Real-World Assets
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    total_value_usdc NUMERIC NOT NULL,
    fractional_share_price_usdc NUMERIC NOT NULL,
    projected_apy NUMERIC NOT NULL, -- e.g., 8.5 for 8.5%
    total_shares_minted INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments/Savings Table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    usdc_invested NUMERIC DEFAULT 0,
    shares_owned INTEGER DEFAULT 0,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_amount_usdc NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pooled Contributions (for friends pooling money together)
CREATE TABLE pooled_funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    initiator_id UUID REFERENCES users(id),
    target_amount_usdc NUMERIC NOT NULL,
    current_amount_usdc NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'OPEN', -- OPEN, FILLED, EXECUTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investments_modtime
BEFORE UPDATE ON investments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
