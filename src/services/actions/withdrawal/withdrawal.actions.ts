"use server";

import {
  withdrawals,
  withdrawalMethod,
} from "@/services/db/schema/withdrawals.schema";
import { getSingle } from "@/lib/utils";
import db from "@/services/db";
import { eq } from "drizzle-orm";
import { profiles } from "@/services/db/schema/profiles.schema";

type BankTransferDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

type CryptoDetails = {
  cryptoCurrency: string;
  cryptoAddress: string;
  cryptoNetwork: string;
};

type WithdrawalDetails = {
  method: (typeof withdrawalMethod.enumValues)[number];
  bankDetails?: BankTransferDetails;
  cryptoDetails?: CryptoDetails;
};

// Create a new withdrawal request
export const createWithdrawalAction = async (
  userId: string,
  amount: number,
  currency: string,
  details: WithdrawalDetails
) => {
  try {
    // Check if user has sufficient balance
    const userProfile = await getSingle(
      db.select().from(profiles).where(eq(profiles.id, userId))
    );

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    if (userProfile.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Validate withdrawal details based on method
    if (details.method === "bank_transfer") {
      if (
        !details.bankDetails?.bankName ||
        !details.bankDetails?.accountNumber ||
        !details.bankDetails?.accountName
      ) {
        throw new Error("Bank transfer details are incomplete");
      }
    } else if (details.method === "crypto") {
      if (
        !details.cryptoDetails?.cryptoCurrency ||
        !details.cryptoDetails?.cryptoAddress ||
        !details.cryptoDetails?.cryptoNetwork
      ) {
        throw new Error("Crypto withdrawal details are incomplete");
      }
    }

    // Create withdrawal request
    const withdrawal = await getSingle(
      db
        .insert(withdrawals)
        .values({
          userId,
          amount,
          currency,
          method: details.method,
          // Bank transfer details
          bankName: details.bankDetails?.bankName,
          accountNumber: details.bankDetails?.accountNumber,
          accountName: details.bankDetails?.accountName,
          // Crypto details
          cryptoCurrency: details.cryptoDetails?.cryptoCurrency,
          cryptoAddress: details.cryptoDetails?.cryptoAddress,
          cryptoNetwork: details.cryptoDetails?.cryptoNetwork,
          status: "pending",
        })
        .returning()
    );

    // Update user's balance
    await db
      .update(profiles)
      .set({
        balance: userProfile.balance - amount,
      })
      .where(eq(profiles.id, userId));

    return withdrawal;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create withdrawal: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while creating withdrawal");
  }
};

// Get user's withdrawal history
export const getUserWithdrawalsAction = async (userId: string) => {
  return db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(withdrawals.createdAt);
};

// Get all withdrawals (for admin)
export const getAllWithdrawalsAction = async () => {
  return db.select().from(withdrawals).orderBy(withdrawals.createdAt);
};

// Update withdrawal status (for admin)
export const updateWithdrawalStatusAction = async (
  withdrawalId: string,
  status: "approved" | "declined",
  adminNotes?: string
) => {
  try {
    const withdrawal = await getSingle(
      db.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId))
    );

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    // If declining, refund the amount to user's balance
    if (status === "declined") {
      const userProfile = await getSingle(
        db.select().from(profiles).where(eq(profiles.id, withdrawal.userId))
      );

      if (userProfile) {
        await db
          .update(profiles)
          .set({
            balance: userProfile.balance + withdrawal.amount,
          })
          .where(eq(profiles.id, withdrawal.userId));
      }
    }

    return await getSingle(
      db
        .update(withdrawals)
        .set({
          status,
          adminNotes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(withdrawals.id, withdrawalId))
        .returning()
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update withdrawal status: ${error.message}`);
    }
    throw new Error(
      "An unexpected error occurred while updating withdrawal status"
    );
  }
};
