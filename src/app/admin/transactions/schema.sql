-- =============================================
-- CLEANUP: Drop existing tables and functions
-- =============================================
DROP FUNCTION IF EXISTS get_recent_users_with_emails(integer);
DROP FUNCTION IF EXISTS add_to_balance(UUID, DECIMAL);
DROP FUNCTION IF EXISTS add_to_bonus(UUID, DECIMAL);
DROP FUNCTION IF EXISTS update_user_plan(UUID, UUID);

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS plans CASCADE;

-- =============================================
-- 1. SUBSCRIPTION PLANS
-- =============================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add default subscription plans
INSERT INTO plans (name, description, price, duration, features) VALUES
('Starter', 'Perfect for beginners', 100, 30, '["Feature 1", "Feature 2", "Feature 3"]'::jsonb),
('Pro', 'For serious investors', 500, 90, '["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]'::jsonb),
('Enterprise', 'Maximum potential', 1000, 180, '["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. USER ACCOUNTS
-- =============================================
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  plan_id UUID REFERENCES plans(id),
  balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0),
  bonus DECIMAL(10, 2) DEFAULT 0 CHECK (bonus >= 0),
  earnings DECIMAL(10, 2) DEFAULT 0 CHECK (earnings >= 0),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own account" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;

-- Create new policies with proper conditions
CREATE POLICY "Users can view their own account"
ON accounts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all accounts"
ON accounts FOR SELECT
TO authenticated
USING (is_admin());

-- =============================================
-- 3. PAYMENT METHODS
-- =============================================
-- Create payment methods table
CREATE TABLE payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('bank', 'crypto')),
  details JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Payment methods access policies
CREATE POLICY "Enable read access for all authenticated users"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for admins"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM accounts 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- =============================================
-- 4. TRANSACTIONS
-- =============================================
-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES plans(id) NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  proof_of_payment TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transaction access policies
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM accounts 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- =============================================
-- 5. STORAGE FOR PAYMENT PROOFS
-- =============================================
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_proofs', 'payment_proofs', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage access policies
CREATE POLICY "Allow authenticated users to upload payment proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment_proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to read their own payment proofs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment_proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow admins to read all payment proofs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment_proofs' AND
    EXISTS (
      SELECT 1 
      FROM accounts 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- =============================================
-- 6. HELPER FUNCTIONS
-- =============================================
-- Create helper functions
CREATE OR REPLACE FUNCTION get_recent_users_with_emails(limit_val integer)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR(255),
  plan_id UUID,
  plan_name VARCHAR(255),
  balance DECIMAL,
  bonus DECIMAL,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.user_id,
    au.email::VARCHAR(255),
    p.id as plan_id,
    p.name as plan_name,
    a.balance,
    a.bonus,
    a.updated_at
  FROM accounts a
  JOIN auth.users au ON au.id = a.user_id
  LEFT JOIN plans p ON p.id = a.plan_id
  ORDER BY a.updated_at DESC
  LIMIT limit_val;
END;
$$;

-- Function to create account if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_account_exists(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO accounts (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Update the update_user_plan function
CREATE OR REPLACE FUNCTION update_user_plan(
  user_id_param UUID,
  plan_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First ensure the account exists
  PERFORM ensure_account_exists(user_id_param);
  
  -- Then update the plan
  UPDATE accounts 
  SET 
    plan_id = plan_id_param,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = user_id_param;
  
  RETURN FOUND;
END;
$$;

-- Update the set_balance function
CREATE OR REPLACE FUNCTION set_balance(user_id_param UUID, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First ensure the account exists
  PERFORM ensure_account_exists(user_id_param);
  
  UPDATE accounts
  SET balance = amount,
      updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;

-- Update the set_bonus function
CREATE OR REPLACE FUNCTION set_bonus(user_id_param UUID, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First ensure the account exists
  PERFORM ensure_account_exists(user_id_param);
  
  UPDATE accounts
  SET bonus = amount,
      updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;

-- Update the add_to_balance function
CREATE OR REPLACE FUNCTION add_to_balance(
  user_id UUID,
  amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance DECIMAL;
BEGIN
  -- First ensure the account exists
  PERFORM ensure_account_exists(user_id);
  
  UPDATE accounts 
  SET 
    balance = COALESCE(balance, 0) + amount,
    updated_at = CURRENT_TIMESTAMP
  WHERE accounts.user_id = add_to_balance.user_id
  RETURNING balance INTO new_balance;
  
  RETURN new_balance;
END;
$$;

-- Update the add_to_bonus function
CREATE OR REPLACE FUNCTION add_to_bonus(
  user_id UUID,
  amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_bonus DECIMAL;
BEGIN
  -- First ensure the account exists
  PERFORM ensure_account_exists(user_id);
  
  UPDATE accounts 
  SET 
    bonus = COALESCE(bonus, 0) + amount,
    updated_at = CURRENT_TIMESTAMP
  WHERE accounts.user_id = add_to_bonus.user_id
  RETURNING bonus INTO new_bonus;
  
  RETURN new_bonus;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION ensure_account_exists TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_plan TO authenticated;
GRANT EXECUTE ON FUNCTION set_balance TO authenticated;
GRANT EXECUTE ON FUNCTION set_bonus TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_balance TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_bonus TO authenticated;

-- Function to get total number of users
CREATE OR REPLACE FUNCTION get_total_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM accounts);
END;
$$;

-- Function to get recent registrations
CREATE OR REPLACE FUNCTION get_recent_registrations(limit_val integer)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.user_id,
    au.email::VARCHAR(255),
    a.created_at
  FROM accounts a
  JOIN auth.users au ON au.id = a.user_id
  ORDER BY a.created_at DESC
  LIMIT limit_val;
END;
$$;

-- Drop existing function
DROP FUNCTION IF EXISTS get_all_users_with_details;

-- Create updated function with earnings and trading_account
CREATE OR REPLACE FUNCTION get_all_users_with_details()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    plan_id UUID,
    plan_name TEXT,
    balance DECIMAL,
    bonus DECIMAL,
    earnings DECIMAL,
    trading_account DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id as user_id,
        au.email,
        au.created_at,
        p.id as plan_id,
        p.name as plan_name,
        COALESCE(a.balance, 0) as balance,
        COALESCE(a.bonus, 0) as bonus,
        COALESCE(a.earnings, 0) as earnings,
        COALESCE(a.trading_account, 0) as trading_account
    FROM auth.users au
    LEFT JOIN accounts a ON au.id = a.user_id
    LEFT JOIN plans p ON a.plan_id = p.id
    ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_with_details() TO authenticated;

-- Create initial admin account if it doesn't exist
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for your admin email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'allenumunade@gmail.com' 
  LIMIT 1;

  -- If we found the user, make them an admin
  IF admin_user_id IS NOT NULL THEN
    -- Update user metadata to mark as admin
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{is_admin}',
      'true'::jsonb
    )
    WHERE id = admin_user_id;

    -- Create or update account with admin flag
    INSERT INTO accounts (user_id, is_admin)
    VALUES (admin_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET is_admin = true;
  END IF;
END $$;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM accounts 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  );
END;
$$;

-- Create a function to get dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS TABLE (
  total_users BIGINT,
  recent_users JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total BIGINT;
  recent JSONB;
BEGIN
  -- Get total users
  SELECT COUNT(*) INTO total FROM accounts;
  
  -- Get recent users
  SELECT jsonb_agg(user_data)
  INTO recent
  FROM (
    SELECT jsonb_build_object(
      'user_id', a.user_id,
      'created_at', a.created_at,
      'email', u.email
    ) as user_data
    FROM accounts a
    JOIN auth.users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 5
  ) subq;

  RETURN QUERY
  SELECT 
    total as total_users,
    COALESCE(recent, '[]'::jsonb) as recent_users;
END;
$$;

-- Function to get recent users with their emails
CREATE OR REPLACE FUNCTION get_recent_users()
RETURNS TABLE (
  created_at timestamptz,
  email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.created_at,
    u.email
  FROM accounts a
  JOIN auth.users u ON u.id = a.user_id
  ORDER BY a.created_at DESC
  LIMIT 5;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_recent_users() TO authenticated;

-- Drop existing function first
DROP FUNCTION IF EXISTS get_dashboard_stats();

-- Create a simple function to get dashboard data that bypasses RLS
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (
      SELECT COUNT(*)
      FROM accounts
    ),
    'recent_users', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'created_at', a.created_at,
          'email', u.email
        )
      )
      FROM (
        SELECT user_id, created_at
        FROM accounts
        ORDER BY created_at DESC
        LIMIT 5
      ) a
      JOIN auth.users u ON u.id = a.user_id
    )
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- Drop existing function first
DROP FUNCTION IF EXISTS get_all_users();

-- Function to get all users
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  created_at TIMESTAMPTZ,
  raw_user_meta_data JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::VARCHAR(255),
    au.created_at,
    au.raw_user_meta_data
  FROM auth.users au
  WHERE (au.raw_user_meta_data->>'is_admin')::boolean IS NOT TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- Drop existing function first
DROP FUNCTION IF EXISTS get_all_users_simple();

-- Function to get all users with their details
CREATE OR REPLACE FUNCTION get_all_users_simple()
RETURNS TABLE (
    user_id UUID,
    email VARCHAR(255),
    plan_id UUID,
    plan_name VARCHAR(255),
    balance DECIMAL,
    bonus DECIMAL,
    trading_points INTEGER,
    earnings DECIMAL,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email::VARCHAR(255),
        a.plan_id,
        COALESCE(p.name, 'No Plan')::VARCHAR(255) as plan_name,
        COALESCE(a.balance, 0) as balance,
        COALESCE(a.bonus, 0) as bonus,
        COALESCE(a.trading_points, 0) as trading_points,
        COALESCE(a.earnings, 0) as earnings,
        COALESCE(a.updated_at, u.created_at) as updated_at
    FROM auth.users u
    LEFT JOIN accounts a ON a.user_id = u.id
    LEFT JOIN plans p ON p.id = a.plan_id
    WHERE u.deleted_at IS NULL
    ORDER BY COALESCE(a.updated_at, u.created_at) DESC;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_all_users_simple() TO authenticated;

-- Function to set trading points
CREATE OR REPLACE FUNCTION public.set_trading_points(
    user_id_param UUID,
    amount INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.accounts
    SET trading_points = amount,
        updated_at = NOW()
    WHERE user_id = user_id_param;
END;
$$;

-- Function to add to trading points
CREATE OR REPLACE FUNCTION public.add_to_trading_points(
    user_id UUID,
    amount INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.accounts
    SET trading_points = COALESCE(trading_points, 0) + amount,
        updated_at = NOW()
    WHERE user_id = user_id;
END;
$$;

-- Function to set earnings
CREATE OR REPLACE FUNCTION public.set_earnings(
    user_id_param UUID,
    amount DECIMAL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.accounts
    SET earnings = amount,
        updated_at = NOW()
    WHERE user_id = user_id_param;
END;
$$;

-- Function to add to earnings
CREATE OR REPLACE FUNCTION public.add_to_earnings(
    user_id UUID,
    amount DECIMAL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.accounts
    SET earnings = COALESCE(earnings, 0) + amount,
        updated_at = NOW()
    WHERE user_id = user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.set_trading_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_trading_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_earnings(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_earnings(UUID, DECIMAL) TO authenticated;

-- Function to get dashboard stats for a user
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id_param UUID)
RETURNS TABLE (
    balance DECIMAL,
    bonus DECIMAL,
    earnings DECIMAL,
    trading_points INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(a.balance, 0) as balance,
        COALESCE(a.bonus, 0) as bonus,
        COALESCE(a.earnings, 0) as earnings,
        COALESCE(a.trading_points, 0) as trading_points
    FROM accounts a
    WHERE a.user_id = user_id_param;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_dashboard_stats(UUID) TO authenticated;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_dashboard_data(user_id_param UUID);

-- Create function to get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(user_id_param UUID)
RETURNS TABLE (
    balance NUMERIC,
    bonus NUMERIC,
    earnings NUMERIC,
    trading_points INTEGER
) 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(a.balance, 0) as balance,
        COALESCE(a.bonus, 0) as bonus,
        COALESCE(a.earnings, 0) as earnings,
        COALESCE(a.trading_points, 0) as trading_points
    FROM auth.users u
    LEFT JOIN accounts a ON a.user_id = u.id
    WHERE u.id = user_id_param;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_dashboard_data(UUID) TO authenticated;