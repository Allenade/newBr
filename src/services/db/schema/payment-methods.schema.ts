import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ~ =============================================>
// ~ ======= Enums
// ~ =============================================>
export const paymentMethodsTypeEnum = pgEnum("payment_methods_types", [
  "CRYPTO",
  "BANK",
]);

// ~ =============================================>
// ~ ======= Table
// ~ =============================================>
export const paymentMethods = pgTable("payment_methods", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  description: text(),
  type: paymentMethodsTypeEnum().default("CRYPTO"),
  enabled: boolean().default(true),
  details: jsonb().$type<
    PaymentMethods.CryptoDetails | PaymentMethods.BankDetails
  >(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});
