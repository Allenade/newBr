"use server";

import db from "@/services/db";
import { userTransactionTotals } from "@/services/db/schema/user-transaction-totals.schema";
import { eq } from "drizzle-orm";

// Get all user transaction totals
export async function getAllUserTransactionTotalsAction() {
  return await db.select().from(userTransactionTotals);
}

// Get transaction totals for a specific user
export async function getUserTransactionTotalsAction(userId: string) {
  return await db
    .select()
    .from(userTransactionTotals)
    .where(eq(userTransactionTotals.user_id, userId));
}

// Update or insert a user's transaction total
export async function upsertUserTransactionTotalAction(
  userId: string,
  type: "transactions" | "deposits" | "withdrawals",
  amount: number
) {
  return await db
    .insert(userTransactionTotals)
    .values({
      user_id: userId,
      type,
      amount: amount.toString(),
    })
    .onConflictDoUpdate({
      target: [userTransactionTotals.user_id, userTransactionTotals.type],
      set: {
        amount: amount.toString(),
        updated_at: new Date(),
      },
    });
}
