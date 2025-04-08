"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase/supabase";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  plan: string;
  balance: number;
  bonus: number;
  avatar_url: string | null;
  updated_at: string;
  created_at: string;
  last_login?: string;
}

interface UserData {
  user_id: string;
  email: string;
  updated_at: string;
  name: string | null;
  avatar_url: string | null;
}

export async function getUsers() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Use the stored procedure to get users
    const { data: users, error: usersError } = (await supabase.rpc(
      "get_recent_users_with_emails",
      { limit_val: 100 }
    )) as {
      data: UserData[] | null;
      error: Error | null;
    };

    if (usersError) {
      console.error("Users error:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log("No users found");
      return {
        data: [],
        error: null,
      };
    }

    // Get account data for each user
    const profiles: Profile[] = await Promise.all(
      users.map(async (user) => {
        const [accountResult, planResult] = await Promise.all([
          supabase
            .from("accounts")
            .select("balance, bonus, updated_at, created_at")
            .eq("user_id", user.user_id)
            .single(),
          supabase
            .from("plans")
            .select("plan_name")
            .eq("user_id", user.user_id)
            .single(),
        ]);

        const account = accountResult.data;
        const accountError = accountResult.error;
        const plan = planResult.data;

        if (accountError) {
          console.error(
            `Error fetching account for user ${user.user_id}:`,
            accountError
          );
        }

        return {
          id: user.user_id,
          email: user.email || "No email",
          full_name: user.name || null,
          username: user.email?.split("@")[0] || null,
          plan: plan?.plan_name || "Free",
          balance: Number(account?.balance || 0),
          bonus: Number(account?.bonus || 0),
          avatar_url: user.avatar_url || null,
          updated_at:
            account?.updated_at || user.updated_at || new Date().toISOString(),
          created_at: account?.created_at || new Date().toISOString(),
          last_login: undefined,
        };
      })
    );

    return {
      data: profiles,
      error: null,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

interface UpdateUserOptions {
  balance?: number;
  bonus?: number;
}

export async function updateUserPlan(
  userId: string,
  planId: string,
  options?: UpdateUserOptions
) {
  try {
    // Update the user's plan in the accounts table
    const { error: accountError } = await supabase
      .from("accounts")
      .update({
        plan: planId,
        ...(options?.balance
          ? {
              balance: supabase.rpc("add_to_balance", {
                user_id: userId,
                amount: options.balance,
              }),
            }
          : {}),
        ...(options?.bonus
          ? {
              bonus: supabase.rpc("add_to_bonus", {
                user_id: userId,
                amount: options.bonus,
              }),
            }
          : {}),
      })
      .eq("user_id", userId);

    if (accountError) throw accountError;

    return { error: null };
  } catch (error) {
    console.error("Error updating user plan:", error);
    return { error: "Failed to update user plan" };
  }
}
