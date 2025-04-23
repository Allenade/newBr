import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { useUser } from "./use-user";
import { PostgrestError } from "@supabase/supabase-js";
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";

interface UpdateTransactionTotalParams {
  userId: string;
  type: "transactions" | "deposits" | "withdrawals";
  amount: number;
}

export const useMutateTransactionTotals = () => {
  const { userAbility } = useUser();
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_PROJECT_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  const updateTransactionTotal = async ({
    userId,
    type,
    amount,
  }: UpdateTransactionTotalParams) => {
    try {
      // Check admin access using userAbility
      if (
        userAbility?.cannot(
          UserPermissions.Actions.manage,
          UserPermissions.Entities.admin_dashboard
        )
      ) {
        throw new Error(
          "Not authorized. Only admins can update transaction totals."
        );
      }

      const { error } = await supabase.from("user_transaction_totals").upsert(
        {
          user_id: userId,
          type,
          amount: amount.toString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,type",
        }
      );

      if (error) throw error;

      toast.success("Transaction total updated successfully");
    } catch (error) {
      console.error("Error updating transaction total:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else if ((error as PostgrestError).code) {
        toast.error("Database error occurred");
      } else {
        toast.error("Failed to update transaction total");
      }
      throw error;
    }
  };

  return {
    updateTransactionTotal,
  };
};
