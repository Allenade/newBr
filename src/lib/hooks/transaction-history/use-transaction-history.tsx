import { useQuery } from "@tanstack/react-query";
import { getTransactionHistoryAction } from "@/services/actions/transaction-history/transaction-history.actions";

export const useTransactionHistory = (userId: string) => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactionHistory", userId],
    queryFn: () => getTransactionHistoryAction(userId),
    enabled: !!userId,
  });

  return {
    transactions,
    isLoading,
  };
};
