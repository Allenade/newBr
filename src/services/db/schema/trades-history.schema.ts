import {
  pgTable,
  uuid,
  timestamp,
  text,
  numeric,
  pgEnum,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.schema";
import { subscriptionPlans } from "./subscription-plans.schema";

// ~ =============================================>
// ~ ======= Enums
// ~ =============================================>
export const tradeTypeEnum = pgEnum("trade_type", ["buy", "sell", "transfer"]);

export const tradeStatusEnum = pgEnum("trade_status", [
  "pending",
  "completed",
  "failed",
  "cancelled",
]);

// ~ =============================================>
// ~ ======= View
// ~ =============================================>
export const tradesHistory = pgTable(
  "trades_history",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => profiles.id),
    planId: uuid("plan_id").references(() => subscriptionPlans.id),
    userName: text("user_name"),
    planName: text("plan_name"),
    tradeType: tradeTypeEnum("trade_type").notNull(),
    amount: numeric().notNull(),
    price: numeric().notNull(),
    totalValue: numeric("total_value").notNull(),
    status: tradeStatusEnum().default("pending"),
    description: text(),
    adminNotes: text("admin_notes"),
    lastModifiedBy: uuid("last_modified_by").references(() => profiles.id),
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
