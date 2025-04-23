"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllTotalDepositsAction,
  getTotalDepositsAction,
} from "@/services/actions/total-deposits/total-deposits.actions";

interface TotalDeposit {
  id: string;
  userId: string | null;
  totalAmount: string;
  balance: string;
  bonus: string;
  earnings: string;
  tradingPoints: string;
  lastDepositDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const useTotalDeposits = (userId?: string) => {
  const queryKey = userId ? ["totalDeposits", userId] : ["totalDeposits"];

  const { data, isLoading, error } = useQuery<TotalDeposit[] | null>({
    queryKey,
    queryFn: async () => {
      if (userId) {
        const result = await getTotalDepositsAction(userId);
        return result ? [result] : null;
      }
      return await getAllTotalDepositsAction();
    },
  });

  return {
    totalDeposits: data,
    isLoading,
    error,
  };
};
