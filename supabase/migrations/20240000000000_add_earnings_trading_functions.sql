-- Add earnings and trading_account columns if they don't exist
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS earnings decimal(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS trading_account decimal(10,2) DEFAULT 0.00;

-- Function to set earnings
CREATE OR REPLACE FUNCTION set_earnings(user_id_param UUID, amount decimal)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts
  SET earnings = amount,
      updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;

-- Function to add to earnings
CREATE OR REPLACE FUNCTION add_to_earnings(user_id UUID, amount decimal)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts
  SET earnings = COALESCE(earnings, 0) + amount,
      updated_at = NOW()
  WHERE user_id = user_id;
END;
$$;

-- Function to set trading account
CREATE OR REPLACE FUNCTION set_trading_account(user_id_param UUID, amount decimal)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts
  SET trading_account = amount,
      updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;

-- Function to add to trading account
CREATE OR REPLACE FUNCTION add_to_trading_account(user_id UUID, amount decimal)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts
  SET trading_account = COALESCE(trading_account, 0) + amount,
      updated_at = NOW()
  WHERE user_id = user_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION set_earnings(UUID, decimal) TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_earnings(UUID, decimal) TO authenticated;
GRANT EXECUTE ON FUNCTION set_trading_account(UUID, decimal) TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_trading_account(UUID, decimal) TO authenticated; 