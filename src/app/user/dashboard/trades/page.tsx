"use client";

import React from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type ComponentProps = Record<string, never>;

const TradesPage: React.FC<ComponentProps> = () => {
  const router = useRouter();

  // Mock data - will be replaced with actual data

  return (
    <Block>
      <BlockBody>
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Trades History
            </h1>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 mt-3">
                <div className="h-[400px] w-full">
                  <iframe
                    src="https://www.tradingview-widget.com/embed-widget/crypto-mkt-screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22crypto_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22dark%22%2C%22market%22%3A%22crypto%22%2C%22enableScrolling%22%3Atrue%2C%22utm_source%22%3A%22www.tradingview.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22cryptomktscreener%22%7D"
                    className="w-full h-full"
                    allowTransparency={true}
                  ></iframe>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Analysis Widget */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 mt-3">
                <div className="h-[400px] w-full">
                  <iframe
                    src="https://www.tradingview-widget.com/embed-widget/technical-analysis/?locale=en#%7B%22interval%22%3A%221D%22%2C%22width%22%3A%22100%25%22%2C%22isTransparent%22%3Afalse%2C%22height%22%3A%22400%22%2C%22symbol%22%3A%22BINANCE%3ABTCUSDT%22%2C%22showIntervalTabs%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22utm_source%22%3A%22www.tradingview.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22technical-analysis%22%7D"
                    className="w-full h-full"
                    allowTransparency={true}
                  ></iframe>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trades Table */}
      </BlockBody>
    </Block>
  );
};

export default TradesPage;
