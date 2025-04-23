"use server";

import db from "@/services/db";
import {
  tradesHistory,
  tradeTypeEnum,
  tradeStatusEnum,
} from "@/services/db/schema/trades-history.schema";
import { eq } from "drizzle-orm";

export const getTradesHistoryAction = async (userId: string) => {
  try {
    const trades = await db
      .select()
      .from(tradesHistory)
      .where(eq(tradesHistory.userId, userId));

    return trades;
  } catch (error) {
    console.error("Error fetching trades history:", error);
    throw new Error("Failed to fetch trades history");
  }
};

export const getAllTradesHistoryAction = async () => {
  try {
    const trades = await db.select().from(tradesHistory);
    return trades;
  } catch (error) {
    console.error("Error fetching all trades history:", error);
    throw new Error("Failed to fetch all trades history");
  }
};

export const createTradeHistoryAction = async (data: {
  userId: string;
  planId: string;
  userName: string;
  planName: string;
  tradeType: (typeof tradeTypeEnum.enumValues)[number];
  amount: string;
  price: string;
  totalValue: string;
  status: (typeof tradeStatusEnum.enumValues)[number];
  description?: string;
  adminNotes?: string;
  lastModifiedBy?: string;
}) => {
  try {
    const result = await db.insert(tradesHistory).values(data);
    return result;
  } catch (error) {
    console.error("Error creating trade history:", error);
    throw new Error("Failed to create trade history");
  }
};

export const updateTradeHistoryAction = async (
  id: string,
  data: Partial<{
    status: (typeof tradeStatusEnum.enumValues)[number];
    description: string;
    adminNotes: string;
    lastModifiedBy: string;
  }>
) => {
  try {
    const result = await db
      .update(tradesHistory)
      .set(data)
      .where(eq(tradesHistory.id, id));
    return result;
  } catch (error) {
    console.error("Error updating trade history:", error);
    throw new Error("Failed to update trade history");
  }
};
