"use client";

import { useEffect, useState, useRef } from "react";
import { usePriceTickerStore } from "@/lib/store/usePriceTickerStore";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

export default function PriceTickerBar() {
  const { prices, loading, error, fetchPriceData } = usePriceTickerStore();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchPriceData();
    setLastUpdated(new Date());

    // Update prices every 30 seconds
    const interval = setInterval(() => {
      fetchPriceData();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPriceData]);

  // Pause animation on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (loading && prices.length === 0) {
    return (
      <div className="bg-black border-t border-gray-800 py-3 overflow-hidden">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin text-[#FFCC00]" />
          <span className="text-sm">Loading price data...</span>
        </div>
      </div>
    );
  }

  if (error && prices.length === 0) {
    return (
      <div className="bg-black border-t border-gray-800 py-3 overflow-hidden">
        <div className="flex items-center justify-center">
          <span className="text-red-500 text-sm">Error loading price data</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-black border-t border-gray-800 py-3 overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10"></div>

      <div
        ref={tickerRef}
        className={`flex items-center ${isPaused ? "" : "animate-marquee"}`}
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {lastUpdated && (
          <div className="flex items-center mr-8 text-xs text-gray-400">
            <RefreshCw className="h-3 w-3 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {prices.map((item, index) => (
          <div key={index} className="flex items-center mr-8 group">
            <span className="font-bold mr-2 text-sm">{item.pair}</span>
            <span className="mr-2 text-sm">
              {item.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={`flex items-center text-xs ${item.change < 0 ? "text-red-500" : "text-green-500"}`}
            >
              {item.change < 0 ? (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              )}
              {Math.abs(item.change).toFixed(item.change < 0.01 ? 5 : 2)} (
              {item.percentChange > 0 ? "+" : ""}
              {item.percentChange.toFixed(2)}%)
            </span>
          </div>
        ))}

        {prices.map((item, index) => (
          <div key={`repeat-${index}`} className="flex items-center mr-8 group">
            <span className="font-bold mr-2 text-sm">{item.pair}</span>
            <span className="mr-2 text-sm">
              {item.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={`flex items-center text-xs ${item.change < 0 ? "text-red-500" : "text-green-500"}`}
            >
              {item.change < 0 ? (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              )}
              {Math.abs(item.change).toFixed(item.change < 0.01 ? 5 : 2)} (
              {item.percentChange > 0 ? "+" : ""}
              {item.percentChange.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
