import { create } from "zustand";

// Define the currency exchange rate interface
interface ExchangeRate {
  [key: string]: {
    [key: string]: number;
  };
}

interface HistoricalRate {
  timestamp: number;
  rates: {
    [key: string]: number;
  };
}

interface CurrencyState {
  rates: ExchangeRate;
  historicalData: {
    [key: string]: HistoricalRate[];
  };
  loading: boolean;
  error: string | null;
  fetchExchangeRates: () => Promise<void>;
  updateRate: (from: string, to: string, rate: number) => void;
  addHistoricalDataPoint: (
    baseCurrency: string,
    timestamp: number,
    rates: { [key: string]: number }
  ) => void;
}

// Sample exchange rate data
const initialRates: ExchangeRate = {
  EUR: {
    EUR: 1,
    USD: 1.082,
    JPY: 161.966,
    GBP: 0.83678,
    CHF: 0.95227,
    AUD: 1.7204,
    CAD: 1.54735,
    NZD: 1.89197,
    CNY: 7.8623,
  },
  USD: {
    EUR: 0.9242,
    USD: 1,
    JPY: 149.704,
    GBP: 0.77301,
    CHF: 0.8795,
    AUD: 1.5898,
    CAD: 1.43,
    NZD: 1.7483,
    CNY: 7.2623,
  },
  JPY: {
    EUR: 0.0061713,
    USD: 0.006676,
    JPY: 1,
    GBP: 0.00516,
    CHF: 0.005872,
    AUD: 0.010616,
    CAD: 0.009548,
    NZD: 0.011677,
    CNY: 0.04842,
  },
  GBP: {
    EUR: 1.1946,
    USD: 1.2927,
    JPY: 193.627,
    GBP: 1,
    CHF: 1.13807,
    AUD: 2.05636,
    CAD: 1.8494,
    NZD: 2.26103,
    CNY: 9.3985,
  },
  CHF: {
    EUR: 1.0493,
    USD: 1.135,
    JPY: 170.079,
    GBP: 0.878,
    CHF: 1,
    AUD: 1.8059,
    CAD: 1.6238,
    NZD: 1.986,
    CNY: 8.2441,
  },
  AUD: {
    EUR: 0.581,
    USD: 0.6284,
    JPY: 94.156,
    GBP: 0.4859,
    CHF: 0.5526,
    AUD: 1,
    CAD: 0.89863,
    NZD: 1.0993,
    CNY: 4.5657,
  },
  CAD: {
    EUR: 0.6459,
    USD: 0.6988,
    JPY: 104.668,
    GBP: 0.5403,
    CHF: 0.6143,
    AUD: 1.1114,
    CAD: 1,
    NZD: 1.2217,
    CNY: 5.0719,
  },
  NZD: {
    EUR: 0.528,
    USD: 0.5716,
    JPY: 85.619,
    GBP: 0.4418,
    CHF: 0.5027,
    AUD: 0.9089,
    CAD: 0.81769,
    NZD: 1,
    CNY: 4.147,
  },
  CNY: {
    EUR: 0.12713,
    USD: 0.1377,
    JPY: 20.614,
    GBP: 0.10635,
    CHF: 0.1209,
    AUD: 0.215,
    CAD: 0.1967,
    NZD: 0.237,
    CNY: 1,
  },
};

// Function to generate slightly different rates for simulation
const generateRandomRates = (baseRates: ExchangeRate): ExchangeRate => {
  const newRates: ExchangeRate = JSON.parse(JSON.stringify(baseRates));

  Object.keys(newRates).forEach((baseCurrency) => {
    Object.keys(newRates[baseCurrency]).forEach((targetCurrency) => {
      if (baseCurrency !== targetCurrency) {
        // Add a small random variation (±0.5%)
        const currentRate = newRates[baseCurrency][targetCurrency];
        const variation = (Math.random() - 0.5) * 0.01 * currentRate;
        newRates[baseCurrency][targetCurrency] = currentRate + variation;
      }
    });
  });

  return newRates;
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  rates: initialRates,
  historicalData: {},
  loading: false,
  error: null,

  fetchExchangeRates: async () => {
    set({ loading: true, error: null });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newRates = generateRandomRates(initialRates);
      set({ rates: newRates, loading: false });

      // Add historical data point for each base currency
      const timestamp = Date.now();
      const currentHistoricalData = { ...get().historicalData };

      Object.keys(newRates).forEach((baseCurrency) => {
        if (!currentHistoricalData[baseCurrency]) {
          currentHistoricalData[baseCurrency] = [];
        }

        currentHistoricalData[baseCurrency].push({
          timestamp,
          rates: { ...newRates[baseCurrency] },
        });

        // Keep only the last 100 data points
        if (currentHistoricalData[baseCurrency].length > 100) {
          currentHistoricalData[baseCurrency] =
            currentHistoricalData[baseCurrency].slice(-100);
        }
      });

      set({ historicalData: currentHistoricalData });
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      set({ loading: false, error: "Failed to fetch exchange rates" });
    }
  },

  updateRate: (from: string, to: string, rate: number) => {
    set((state) => {
      const newRates = { ...state.rates };
      if (newRates[from]) {
        newRates[from] = { ...newRates[from], [to]: rate };
      }
      return { rates: newRates };
    });
  },

  addHistoricalDataPoint: (
    baseCurrency: string,
    timestamp: number,
    rates: { [key: string]: number }
  ) => {
    set((state) => {
      const newHistoricalData = { ...state.historicalData };

      if (!newHistoricalData[baseCurrency]) {
        newHistoricalData[baseCurrency] = [];
      }

      // Add new data point
      newHistoricalData[baseCurrency].push({
        timestamp,
        rates,
      });

      // Keep only the last 100 data points
      if (newHistoricalData[baseCurrency].length > 100) {
        newHistoricalData[baseCurrency] =
          newHistoricalData[baseCurrency].slice(-100);
      }

      return { historicalData: newHistoricalData };
    });
  },
}));
