import { useQuery } from "@tanstack/react-query";
import { getTradesHistoryAction } from "@/services/actions/trades-history/trades-history.actions";

export const useTradesHistory = (userId: string) => {
  const { data: trades, isLoading } = useQuery({
    queryKey: ["tradesHistory", userId],
    queryFn: () => getTradesHistoryAction(userId),
    enabled: !!userId,
  });

  return {
    trades,
    isLoading,
  };
};
