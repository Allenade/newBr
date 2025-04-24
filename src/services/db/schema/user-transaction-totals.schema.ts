import {
  pgTable,
  uuid,
  timestamp,
  numeric,
  text,
  uniqueIndex,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.schema";

export const userTransactionTotals = pgTable(
  "user_transaction_totals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .references(() => profiles.id)
      .notNull(),
    type: text("type", {
      enum: ["transactions", "deposits", "withdrawals"],
    }).notNull(),
    amount: numeric("amount").notNull(),
    updated_at: timestamp("updated_at").defaultNow(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Add unique constraint for user_id and type combination
    userIdTypeUnique: uniqueIndex(
      "user_transaction_totals_user_id_type_unique"
    ).on(table.user_id, table.type),

    // Insert policy
    insertPolicy: pgPolicy("Enable insert for authenticated users only", {
      as: "permissive",
      to: "authenticated",
      for: "insert",
      withCheck: sql`true`,
    }),

    // Select policy
    selectPolicy: pgPolicy("Enable read access for all users", {
      as: "permissive",
      to: "public",
      for: "select",
      using: sql`true`,
    }),

    // Update policy
    updatePolicy: pgPolicy("Enable update for users based on email", {
      as: "permissive",
      to: "authenticated",
      for: "update",
      using: sql`(auth.jwt() ->> "email")::text = (SELECT email FROM profiles WHERE id = user_id)`,
      withCheck: sql`(auth.jwt() ->> 'email')::text = (SELECT email FROM profiles WHERE id = user_id)`,
    }),

    // Delete policy
    deletePolicy: pgPolicy("Enable delete for admins only", {
      as: "permissive",
      to: "authenticated",
      for: "delete",
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
  })
).enableRLS();

// SQL to create policies
export const createPolicies = sql`
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable admin access" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Enable users to view their own totals" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Allow admins to select transaction totals" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Allow admins to insert transaction totals" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Allow admins to update transaction totals" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Allow admins to delete transaction totals" ON user_transaction_totals;
  DROP POLICY IF EXISTS "Allow users to view their own transaction totals" ON user_transaction_totals;

  -- Create new policies
  CREATE POLICY "admin_all_access" ON user_transaction_totals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

  CREATE POLICY "user_select_own" ON user_transaction_totals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
`;
