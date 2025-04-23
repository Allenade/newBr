"use server";

import db from "@/services/db";
import { getSingle, getMany } from "@/lib/utils";
import { totalDeposits } from "@/services/db/schema/total-deposits.schema";
import { eq } from "drizzle-orm";
import { profiles } from "@/services/db/schema/profiles.schema";

// ~ =============================================>
// ~ ======= Get all total deposits  -->
// ~ =============================================>
export const getAllTotalDepositsAction = async () => {
  return await getMany(db.select().from(totalDeposits));
};

// ~ =============================================>
// ~ ======= Get total deposits for a user  -->
// ~ =============================================>
export const getTotalDepositsAction = async (userId: string) => {
  return await getSingle(
    db.select().from(totalDeposits).where(eq(totalDeposits.userId, userId))
  );
};

// ~ =============================================>
// ~ ======= Create total deposits  -->
// ~ =============================================>
export const createTotalDepositsAction = async (userId: string) => {
  // Get user's profile data
  const profile = await getSingle(
    db.select().from(profiles).where(eq(profiles.id, userId))
  );

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Calculate total amount from all sources
  const totalAmount = (
    profile.balance +
    profile.bonus +
    profile.earnings +
    profile.tradingPoints
  ).toString();

  return await getSingle(
    db
      .insert(totalDeposits)
      .values({
        userId,
        totalAmount,
        balance: profile.balance.toString(),
        bonus: profile.bonus.toString(),
        earnings: profile.earnings.toString(),
        tradingPoints: profile.tradingPoints.toString(),
        lastDepositDate: new Date().toISOString(),
      })
      .returning()
  );
};

// ~ =============================================>
// ~ ======= Update total deposits  -->
// ~ =============================================>
export const updateTotalDepositsAction = async (userId: string) => {
  // Get user's profile data
  const profile = await getSingle(
    db.select().from(profiles).where(eq(profiles.id, userId))
  );

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Calculate total amount from all sources
  const totalAmount = (
    profile.balance +
    profile.bonus +
    profile.earnings +
    profile.tradingPoints
  ).toString();

  const existingDeposit = await getTotalDepositsAction(userId);

  if (existingDeposit) {
    // Update existing record
    return await getSingle(
      db
        .update(totalDeposits)
        .set({
          totalAmount,
          balance: profile.balance.toString(),
          bonus: profile.bonus.toString(),
          earnings: profile.earnings.toString(),
          tradingPoints: profile.tradingPoints.toString(),
          lastDepositDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(totalDeposits.userId, userId))
        .returning()
    );
  } else {
    // Create new record
    return await createTotalDepositsAction(userId);
  }
};
