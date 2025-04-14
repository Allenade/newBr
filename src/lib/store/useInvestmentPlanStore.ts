import { create } from "zustand";

interface AccountTier {
  id: string;
  title: string;
  deposit: string;
  features: string[];
  lessons: string[];
  additionalBenefits?: string[];
  riskFreeTrade?: string;
}

interface InvestmentPlanState {
  accountTiers: AccountTier[];
  leverageInfo: string;
}

export const useInvestmentPlanStore = create<InvestmentPlanState>(() => ({
  accountTiers: [
    {
      id: "mini",
      title: "Mini Account",
      deposit: "500+",
      features: [
        "Access to all trading assets: Currencies, Shares, Commodities, Indexes",
        "24/7 Support",
      ],
      lessons: [
        "Get lesson 1 – Introduction to the platform",
        "Get lesson 2 – Trading rules",
      ],
    },
    {
      id: "silver",
      title: "Silver Account",
      deposit: "1,500+",
      features: [
        "Access to all trading assets: Currencies, Shares, Commodities, Indexes",
        "24/7 Support",
      ],
      lessons: [
        "Get lesson 1 – Introduction to the platform",
        "Get lesson 4 – Using pivot table and Fibonacci strategy",
      ],
      additionalBenefits: [
        "Get an additional 2% return on every trade you make",
      ],
    },
    {
      id: "gold",
      title: "Gold Account",
      deposit: "15,000+",
      features: [
        "Access to all trading assets: Currencies, Shares, Commodities, Indexes",
        "Access to all trading assets: Currencies, Shares, Commodities, Indexes",
        "24/7 Support",
      ],
      lessons: [
        "Get lesson 1 – Introduction to the platform",
        "Get lesson 4 – Using pivot table and Fibonacci strategy",
      ],
      additionalBenefits: [
        "Get an additional 2% return on every trade you make",
      ],
    },
    {
      id: "platinum",
      title: "Platinum Account",
      deposit: "50,000+",
      features: [
        "Access to all trading assets: Currencies, Shares, Commodities, Indexes",
        "Access to all trading assets: Currencies, Shares, Commodities, Indexes",
        "24/7 Support",
      ],
      lessons: [
        "Get lesson 7 – How to read a chart on netdania.com",
        "Get lesson 8 – How to analyze the chart and strategy of support and resistance",
      ],
      additionalBenefits: [
        "Get an additional 4% return on every trade you make",
      ],
      riskFreeTrade:
        "Risk-free trade (Up to 1K) every month for a Platinum account",
    },
  ],
  leverageInfo: "All account types get leverage up to 1:500",
}));
