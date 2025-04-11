import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgPolicy,
  real as float,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { generateIconUrl } from "@/lib/utils";

// ~ =============================================>
// ~ ======= Table
// ~ =============================================>
export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    otherNames: text("other_names"),
    imageUrl: text("image_url").default(generateIconUrl()),
    email: text("email").notNull(),
    subscriptionPlanId: uuid(),
    balance: float().default(0).notNull(),
    bonus: float().default(0).notNull(),
    earnings: float().default(0).notNull(),
    tradingPoints: float("trading_points").default(0).notNull(),
    isActive: boolean("is_active").default(true),
    isAdmin: boolean("is_admin"),
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
  ],
).enableRLS();
