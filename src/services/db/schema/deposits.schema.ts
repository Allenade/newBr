import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const deposits = pgTable("deposits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  amount: varchar("amount").notNull(),
  method: varchar("method").notNull(),
  transactionId: varchar("transaction_id").notNull(),
  status: varchar("status", {
    enum: ["pending", "completed", "failed", "cancelled"],
  }).default("pending"),
  isVerified: boolean("is_verified").default(false),
  ipAddress: varchar("ip_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
