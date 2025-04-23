"use server";

import db from "@/services/db";
import {
  transaction,
  transactionStatusEnum,
} from "@/services/db/schema/transactions.schema";
import { eq } from "drizzle-orm";

export const updateTransactionStatusAction = async (
  id: string,
  status: (typeof transactionStatusEnum.enumValues)[number]
) => {
  try {
    const result = await db
      .update(transaction)
      .set({ status })
      .where(eq(transaction.id, id));
    return result;
  } catch (error) {
    console.error("Error updating transaction status:", error);
    throw new Error("Failed to update transaction status");
  }
};

export const createTransactionAction = async (data: {
  profileId: string;
  subscriptionPlanId: string;
  amount: string;
  status?: (typeof transactionStatusEnum.enumValues)[number];
}) => {
  try {
    const result = await db.insert(transaction).values({
      ...data,
      status: data.status || "pending",
    });
    return result;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction");
  }
};

export const getTransactionAction = async (id: string) => {
  try {
    const result = await db
      .select()
      .from(transaction)
      .where(eq(transaction.id, id));
    return result[0];
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw new Error("Failed to fetch transaction");
  }
};

export const getUserTransactionsAction = async (profileId: string) => {
  try {
    const result = await db
      .select()
      .from(transaction)
      .where(eq(transaction.profileId, profileId));
    return result;
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    throw new Error("Failed to fetch user transactions");
  }
};
