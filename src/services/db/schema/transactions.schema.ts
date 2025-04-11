import { numeric, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "@/services/db/schema/profiles.schema";
import { subscriptionPlans } from "@/services/db/schema/subscription-plans.schema";

// ~ =============================================>
// ~ ======= Enums
// ~ =============================================>
export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "approved",
  "declined",
]);

// ~ =============================================>
// ~ ======= Table
// ~ =============================================>
export const transaction = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  profileId: uuid().references(() => profiles.id),
  subscriptionPlanId: uuid().references(() => subscriptionPlans.id),
  amount: numeric(),
  status: transactionStatusEnum().default("pending"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});
