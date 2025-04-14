import { create } from "zustand";
import { createClient } from "@/services/db/supabase/client";

interface AccountData {
  accountBalance: number;
  totalProfit: number;
  bonus: number;
  tradingAccounts: number;
  isLoading: boolean;
  error: string | null;

  // Methods
  fetchAccountData: (userId: string) => Promise<void>;
}

// Check if we're in the preview environment
const isPreview =
  typeof window !== "undefined" &&
  window.location.hostname.includes("vercel.app");

// Initialize Supabase client
const supabase = createClient();

export const useAccountStore = create<AccountData>((set) => ({
  accountBalance: 0,
  totalProfit: 0,
  bonus: 0,
  tradingAccounts: 0,
  isLoading: false,
  error: null,

  fetchAccountData: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // In preview mode, return mock data
      if (isPreview) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({
          accountBalance: 5000.75,
          totalProfit: 750.25,
          bonus: 100,
          tradingAccounts: 2,
        });
        return;
      }

      // In a real environment, fetch from Supabase
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // If no account found, return mock data
        if (error.code === "PGRST116") {
          set({
            accountBalance: 0,
            totalProfit: 0,
            bonus: 0,
            tradingAccounts: 0,
          });
          return;
        }
        throw error;
      }

      if (data) {
        set({
          accountBalance: data.balance,
          totalProfit: data.total_profit,
          bonus: data.bonus,
          tradingAccounts: 1, // Or count from a related table
        });
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      set({ error: (error as Error).message });

      // Fallback to mock data on error
      set({
        accountBalance: 5000.75,
        totalProfit: 750.25,
        bonus: 100,
        tradingAccounts: 2,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
