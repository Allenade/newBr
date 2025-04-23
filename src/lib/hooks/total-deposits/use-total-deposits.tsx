import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTotalDepositsAction,
  updateTotalDepositsAction,
} from "@/services/actions/total-deposits/total-deposits.actions";

export const useTotalDeposits = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: totalDeposits, isLoading } = useQuery({
    queryKey: ["totalDeposits", userId],
    queryFn: () => getTotalDepositsAction(userId),
    enabled: !!userId,
  });

  const { mutate: updateTotalDeposits, isPending: isUpdating } = useMutation({
    mutationFn: () => updateTotalDepositsAction(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["totalDeposits", userId] });
    },
  });

  return {
    totalDeposits,
    isLoading,
    updateTotalDeposits,
    isUpdating,
  };
};
