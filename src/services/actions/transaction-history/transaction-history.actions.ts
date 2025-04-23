"use server";

import db from "@/services/db";
import { transactionHistory } from "@/services/db/schema/transaction-history.schema";
import { eq } from "drizzle-orm";

export const getTransactionHistoryAction = async (userId: string) => {
  return await db
    .select()
    .from(transactionHistory)
    .where(eq(transactionHistory.userId, userId));
};
