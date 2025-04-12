"use client";

import React, { FC } from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useUser } from "@/lib/hooks/user/use-user";

type ComponentProps = {};

const UserOverviewPage: FC<ComponentProps> = ({}) => {
  const { profile, profileIsLoading } = useUser();

  return (
    <Block>
      <BlockBody>
        {/* ####################################### */}
        {/* -- Top section --> */}
        {/* ####################################### */}
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <div className="flex items-center space-x-2">
            <Button>
              <Coins size={18} strokeWidth={1.5} className="mr-1" /> New Deposit
            </Button>
          </div>
        </div>

        {/* ####################################### */}
        {/* -- Account summary cards --> */}
        {/* ####################################### */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Available Balance
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              $
              {profileIsLoading
                ? "..."
                : parseFloat(profile?.balance).toFixed(2)}{" "}
              USD
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              My Earnings
            </h3>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
              $
              {profileIsLoading
                ? "..."
                : parseFloat(profile?.earnings).toFixed(2)}{" "}
              USD
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Bonus
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              $
              {profileIsLoading ? "..." : parseFloat(profile?.bonus).toFixed(2)}{" "}
              USD
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Trading Points
            </h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
              {profileIsLoading ? "..." : profile?.tradingPoints}
            </p>
          </div>
        </div>

        {/* ####################################### */}
        {/* -- Market overview --> */}
        {/* ####################################### */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 mt-3">
          <div className="h-[400px] w-full">
            <iframe
              src="https://www.tradingview-widget.com/embed-widget/crypto-mkt-screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22crypto_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22dark%22%2C%22market%22%3A%22crypto%22%2C%22enableScrolling%22%3Atrue%2C%22utm_source%22%3A%22www.tradingview.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22cryptomktscreener%22%7D"
              className="w-full h-full"
              allowTransparency={true}
            ></iframe>
          </div>
        </div>
      </BlockBody>
    </Block>
  );
};

export default UserOverviewPage;
