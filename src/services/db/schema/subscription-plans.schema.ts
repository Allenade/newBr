import {
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ~ =============================================>
// ~ ======= Table
// ~ =============================================>
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  description: text(),
  price: numeric(),
  duration: numeric(),
  features: jsonb(),
  bonusAmount: numeric("bonus_amount"),
  returnPercent: numeric("return_percent"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});
