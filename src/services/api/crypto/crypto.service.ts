import axios from "axios";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export interface CryptoChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface CryptoMarketData {
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

export class CryptoService {
  static async getHistoricalData(
    coinId: string,
    days: number = 1,
    interval: string = "minute"
  ): Promise<CryptoChartData> {
    try {
      const response = await axios.get(
        `${COINGECKO_API_URL}/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days,
            interval,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw error;
    }
  }

  static async getMarketData(coinId: string): Promise<CryptoMarketData> {
    try {
      const response = await axios.get(`${COINGECKO_API_URL}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
        },
      });
      return {
        current_price: response.data.market_data.current_price.usd,
        price_change_percentage_24h:
          response.data.market_data.price_change_percentage_24h,
        total_volume: response.data.market_data.total_volume.usd,
        market_cap: response.data.market_data.market_cap.usd,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      throw error;
    }
  }

  static convertToCandlestickData(prices: [number, number][]): Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }> {
    const candlestickData = [];
    const timeframes = new Map<number, number[]>();

    // Group prices by minute
    for (const [timestamp, price] of prices) {
      const minute = Math.floor(timestamp / 60000) * 60000;
      if (!timeframes.has(minute)) {
        timeframes.set(minute, []);
      }
      timeframes.get(minute)?.push(price);
    }

    // Create candlestick data
    for (const [timestamp, prices] of timeframes) {
      if (prices.length > 0) {
        candlestickData.push({
          time: timestamp / 1000,
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
        });
      }
    }

    return candlestickData;
  }
}
