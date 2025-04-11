"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/services/db/supabase/client";

export default function UserDashboard() {
  const [accountData, setAccountData] = useState({
    balance: 3.0, // Setting default test values
    bonus: 4.0,
    earnings: 6.0,
    trading_points: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        // Get the current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        console.log("Auth check:", { user, userError });

        if (userError) {
          setError("Auth error: " + userError.message);
          return;
        }

        if (!user) {
          setError("No user found");
          return;
        }

        // Try direct query first
        console.log("Fetching account data for user:", user.id);
        const { data: directData, error: directError } = await supabase
          .from("accounts")
          .select(
            `
            balance,
            bonus,
            earnings,
            trading_points
          `,
          )
          .eq("user_id", user.id)
          .single();

        console.log("Direct query result:", { directData, directError });

        if (!directError && directData) {
          console.log("Setting data from direct query:", directData);
          setAccountData({
            balance: directData.balance || 3.0,
            bonus: directData.bonus || 4.0,
            earnings: directData.earnings || 6.0,
            trading_points: directData.trading_points || 100,
          });
        } else {
          console.log("Direct query failed, trying RPC");
          // Fallback to RPC
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            "get_user_dashboard_data",
            {
              user_id_param: user.id,
            },
          );

          console.log("RPC result:", { rpcData, rpcError });

          if (rpcError) {
            setError("RPC error: " + rpcError.message);
            return;
          }

          if (rpcData && rpcData.length > 0) {
            console.log("Setting data from RPC:", rpcData[0]);
            setAccountData({
              balance: rpcData[0].balance || 3.0,
              bonus: rpcData[0].bonus || 4.0,
              earnings: rpcData[0].earnings || 6.0,
              trading_points: rpcData[0].trading_points || 100,
            });
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("Fetch error: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debug output
  console.log("Current account data:", accountData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Control panel
        </p>
        {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Available Balance
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            ${loading ? "..." : parseFloat(accountData.balance).toFixed(2)} USD
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            My Earnings
          </h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
            ${loading ? "..." : parseFloat(accountData.earnings).toFixed(2)} USD
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Bonus
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            ${loading ? "..." : parseFloat(accountData.bonus).toFixed(2)} USD
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Trading Points
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
            {loading ? "..." : accountData.trading_points}
          </p>
        </div>
      </div>

      {/* Market Overview */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="h-[400px] w-full">
          <iframe
            src="https://www.tradingview-widget.com/embed-widget/crypto-mkt-screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22crypto_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22dark%22%2C%22market%22%3A%22crypto%22%2C%22enableScrolling%22%3Atrue%2C%22utm_source%22%3A%22www.tradingview.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22cryptomktscreener%22%7D"
            className="w-full h-full"
            frameBorder="0"
            allowTransparency="true"
            scrolling="yes"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
