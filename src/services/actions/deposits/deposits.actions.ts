import db from "@/services/db";
import { deposits } from "@/services/db/schema/deposits.schema";
import { eq } from "drizzle-orm";

export async function createDepositAction(data: {
  userId: string;
  amount: number;
  method: string;
  transactionId: string;
  ipAddress?: string;
  notes?: string;
}) {
  const [deposit] = await db
    .insert(deposits)
    .values({
      userId: data.userId,
      amount: data.amount.toString(),
      method: data.method,
      transactionId: data.transactionId,
      ipAddress: data.ipAddress,
      notes: data.notes,
    })
    .returning();

  return deposit;
}

export async function getDepositsByUserIdAction(userId: string) {
  const userDeposits = await db
    .select()
    .from(deposits)
    .where(eq(deposits.userId, userId))
    .orderBy(deposits.createdAt);

  return userDeposits;
}

export async function getAllDepositsAction() {
  const allDeposits = await db
    .select()
    .from(deposits)
    .orderBy(deposits.createdAt);

  return allDeposits;
}

export async function updateDepositStatusAction(
  depositId: string,
  status: "pending" | "completed" | "failed" | "cancelled",
  isVerified: boolean = false
) {
  const [updatedDeposit] = await db
    .update(deposits)
    .set({
      status,
      isVerified,
      updatedAt: new Date(),
    })
    .where(eq(deposits.id, depositId))
    .returning();

  return updatedDeposit;
}
