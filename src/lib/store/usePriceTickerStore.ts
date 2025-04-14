import { create } from "zustand";

interface PriceData {
  pair: string;
  price: number;
  change: number;
  percentChange: number;
}

interface PriceTickerState {
  prices: PriceData[];
  loading: boolean;
  error: string | null;
  fetchPriceData: () => Promise<void>;
  updatePrice: (priceData: PriceData) => void;
}

export const usePriceTickerStore = create<PriceTickerState>((set) => ({
  prices: [
    { pair: "BTC/USD", price: 82580, change: -28.0, percentChange: -0.03 },
    { pair: "ETH/USD", price: 1815.1, change: -12.1, percentChange: -0.66 },
    { pair: "EUR/USD", price: 1.082, change: -0.00037, percentChange: -0.03 },
  ],
  loading: false,
  error: null,

  fetchPriceData: async () => {
    set({ loading: true, error: null });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate some random price changes
      const newPrices = [
        {
          pair: "BTC/USD",
          price: 82580 + Math.floor(Math.random() * 200 - 100),
          change: Math.floor(Math.random() * 100 - 50) / 10,
          percentChange: Math.floor(Math.random() * 100 - 50) / 100,
        },
        {
          pair: "ETH/USD",
          price: 1815.1 + Math.floor(Math.random() * 20 - 10),
          change: Math.floor(Math.random() * 50 - 25) / 10,
          percentChange: Math.floor(Math.random() * 100 - 50) / 100,
        },
        {
          pair: "EUR/USD",
          price: 1.082 + Math.floor(Math.random() * 1000 - 500) / 100000,
          change: Math.floor(Math.random() * 100 - 50) / 100000,
          percentChange: Math.floor(Math.random() * 100 - 50) / 1000,
        },
      ];

      set({ prices: newPrices, loading: false });
    } catch (error) {
      set({ loading: false, error: "Failed to fetch price data" });
    }
  },

  updatePrice: (priceData: PriceData) => {
    set((state) => {
      const index = state.prices.findIndex((p) => p.pair === priceData.pair);
      if (index !== -1) {
        const newPrices = [...state.prices];
        newPrices[index] = priceData;
        return { prices: newPrices };
      }
      return state;
    });
  },
}));
