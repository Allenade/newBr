"use client";

import React from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/hooks/user/use-user";

const TotalDepositsPage = () => {
  const { profile, profileIsLoading } = useUser();

  // Calculate grand total from existing profile data
  const grandTotal =
    (profile?.balance || 0) +
    (profile?.earnings || 0) +
    (profile?.bonus || 0) +
    (profile?.tradingPoints || 0);

  return (
    <Block>
      <BlockBody>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/user/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-bold">Total Deposits</h2>
          </div>
        </div>

        {/* Summary Cards - Same as Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Available Balance
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              ${profileIsLoading ? "..." : (profile?.balance || 0).toFixed(2)}{" "}
              USD
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              My Earnings
            </h3>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
              ${profileIsLoading ? "..." : (profile?.earnings || 0).toFixed(2)}{" "}
              USD
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Bonus
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              ${profileIsLoading ? "..." : (profile?.bonus || 0).toFixed(2)} USD
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Trading Points
            </h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
              $
              {profileIsLoading
                ? "..."
                : (profile?.tradingPoints || 0).toFixed(2)}{" "}
              USD
            </p>
          </div>
        </div>

        {/* Grand Total Card */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
            Grand Total
          </h3>
          <p className="text-3xl font-bold text-primary">
            ${profileIsLoading ? "..." : grandTotal.toFixed(2)} USD
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Total of all your assets combined
          </p>
        </div>
      </BlockBody>
    </Block>
  );
};

export default TotalDepositsPage;
