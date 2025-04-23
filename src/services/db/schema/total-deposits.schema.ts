import {
  pgTable,
  uuid,
  timestamp,
  numeric,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.schema";

// ~ =============================================>
// ~ ======= Table
// ~ =============================================>
export const totalDeposits = pgTable(
  "total_deposits",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => profiles.id),
    totalAmount: numeric("total_amount").default("0").notNull(),
    balance: numeric("balance").default("0").notNull(),
    bonus: numeric("bonus").default("0").notNull(),
    earnings: numeric("earnings").default("0").notNull(),
    tradingPoints: numeric("trading_points").default("0").notNull(),
    lastDepositDate: timestamp("last_deposit_date", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  () => [
    // ~ ======= insert policy -->
    pgPolicy("Enable insert for authenticated users only", {
      as: "permissive",
      to: "authenticated",
      for: "insert",
      withCheck: sql`true`,
    }),

    // ~ ======= select policy -->
    pgPolicy("Enable read access for users based on role", {
      as: "permissive",
      to: "authenticated",
      for: "select",
      using: sql`(
        auth.jwt() ->> 'role' = 'admin' OR 
        (auth.jwt() ->> 'role' = 'user' AND user_id = auth.uid())
      )`,
    }),

    // ~ ======= update policy -->
    pgPolicy("Enable update for admins only", {
      as: "permissive",
      to: "authenticated",
      for: "update",
      using: sql`auth.jwt() ->> 'role' = 'admin'`,
      withCheck: sql`auth.jwt() ->> 'role' = 'admin'`,
    }),
  ]
).enableRLS();
