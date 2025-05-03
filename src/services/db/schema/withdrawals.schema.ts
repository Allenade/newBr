import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  real as float,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.schema";

// ~ =============================================>
// ~ ======= Enum  -->
// ~ =============================================>
export const withdrawalStatus = pgEnum("withdrawal_status", [
  "pending",
  "approved",
  "declined",
]);

export const withdrawalMethod = pgEnum("withdrawal_method", [
  "bank_transfer",
  "crypto",
]);

// ~ =============================================>
// ~ ======= Table
// ~ =============================================>
export const withdrawals = pgTable(
  "withdrawals",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    amount: float().notNull(),
    currency: text().notNull(),
    method: withdrawalMethod("method").notNull(),
    // For bank transfers
    bankName: text("bank_name"),
    accountNumber: text("account_number"),
    accountName: text("account_name"),
    // For crypto
    cryptoCurrency: text("crypto_currency"),
    cryptoAddress: text("crypto_address"),
    cryptoNetwork: text("crypto_network"), // e.g., "ERC20", "BEP20", "TRC20"
    // Status and timestamps
    status: withdrawalStatus("status").default("pending").notNull(),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
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
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      to: "public",
      for: "select",
      using: sql`true`,
    }),

    // ~ ======= update policy -->
    pgPolicy("Enable update for users based on email", {
      as: "permissive",
      to: "authenticated",
      for: "update",
      using: sql`(auth.jwt() ->> "email")::text = email`,
      withCheck: sql`(auth.jwt() ->> 'email')::text = email`,
    }),

    // ~ ======= delete policy -->
    pgPolicy("Enable delete for admins only", {
      as: "permissive",
      to: "authenticated",
      for: "delete",
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
  ]
).enableRLS();
