import { pgTable, uuid, timestamp, text, numeric } from "drizzle-orm/pg-core";
import { profiles } from "./profiles.schema";
import { subscriptionPlans } from "./subscription-plans.schema";
import { transaction, transactionStatusEnum } from "./transactions.schema";

// ~ =============================================>
// ~ ======= View
// ~ =============================================>
export const transactionHistory = pgTable("transaction_history", {
  id: uuid().primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transaction.id),
  userId: uuid("user_id").references(() => profiles.id),
  planId: uuid("plan_id").references(() => subscriptionPlans.id),
  userName: text("user_name"),
  planName: text("plan_name"),
  amount: numeric(),
  status: transactionStatusEnum(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});
