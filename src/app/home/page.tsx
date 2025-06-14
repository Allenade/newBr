"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
// import BitcoinCalculator from "@/components/bitcoin-calculator"
// import InvestmentPlan from "@/components/investment-plan/investment-plan"
// import CurrencyExchangeChart from "@/components/currency-exchange-chart"
import Header from "./component/header";
import Footer from "./component/footer";
import PriceTickerBar from "./component/PriceTickerBar";
import { useCurrencyStore } from "@/lib/store/useCurrencyStore";
import { motion } from "framer-motion";

export default function HomePage() {
  const { fetchExchangeRates } = useCurrencyStore();

  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20 w-full max-w-full overflow-x-hidden">
        <div className="w-full">
          {/* {isPreview && (
            <div className="fixed top-24 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-2">Preview Mode</h3>
              <p className="mb-3 text-sm">Access the dashboard directly:</p>
              <Link href="/dashboard">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  View Dashboard
                </Button>
              </Link>
            </div>
          )} */}

          <div className="relative bg-[url('/bitcoin-bg.jpg')] bg-cover bg-center min-h-[600px] flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
            <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center justify-between">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-white">
                  Trade Bitcoin CFDs
                  <br />
                  with Leverage of
                  <br />
                  up to 1:5
                </h1>
                <p className="text-gray-300 mb-8 max-w-lg text-lg">
                  Experience professional trading with Dovexa. Start with as
                  little as $100 and trade with confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup">
                    <Button className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
                      Start Trading
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  {/* <Button
                    variant="outline"
                    className="rounded-lg p-4 border-white/30 hover:bg-white/10 transition-all transform hover:scale-105"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Watch Tutorial
                  </Button> */}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="md:w-1/2 w-full"
              >
                {/* Placeholder for calculator or chart */}
                <div className="bg-gradient-to-br from-[#1a2e44]/50 to-[#0a1929]/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-4 text-[#FFCC00]">
                    Live Market Data
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg">
                      <span>BTC/USD</span>
                      <span className="text-[#FFCC00]">$45,678.90</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg">
                      <span>ETH/USD</span>
                      <span className="text-[#FFCC00]">$2,345.67</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="py-16 bg-black">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-white">
                  Why Choose Dovexa?
                </h2>
                <p className="text-gray-400 text-lg">
                  Bitcoin is a new generation of decentralized digital currency,
                  created and operating only on the Internet. With Dovexa, you
                  can trade Bitcoin and other cryptocurrencies with professional
                  tools and support.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="py-16 bg-gradient-to-b from-black to-[#0a1929]">
            <div className="container mx-auto px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-white"
              >
                Platform Features
              </motion.h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <p className="mb-6 text-gray-300 text-lg">
                    We provide our clients with modern technologies. No delays
                    in order executions and most accurate quotes. Our trading
                    platform is available around the clock and on weekends.
                    Dovexa customer service is available 24/7. We are
                    continuously adding new financial instruments.
                  </p>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-4 text-[#FFCC00]">
                      Key Benefits
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-center group">
                        <span className="text-[#FFCC00] mr-3 text-xl group-hover:scale-110 transition-transform">
                          •
                        </span>
                        <span className="group-hover:text-[#FFCC00] transition-colors">
                          Advanced technical analysis tools
                        </span>
                      </li>
                      <li className="flex items-center group">
                        <span className="text-[#FFCC00] mr-3 text-xl group-hover:scale-110 transition-transform">
                          •
                        </span>
                        <span className="group-hover:text-[#FFCC00] transition-colors">
                          Social trading: watch deals across the globe in
                          real-time
                        </span>
                      </li>
                      <li className="flex items-center group">
                        <span className="text-[#FFCC00] mr-3 text-xl group-hover:scale-110 transition-transform">
                          •
                        </span>
                        <span className="group-hover:text-[#FFCC00] transition-colors">
                          Over 100 assets including popular stocks
                        </span>
                      </li>
                      <li className="flex items-center group">
                        <span className="text-[#FFCC00] mr-3 text-xl group-hover:scale-110 transition-transform">
                          •
                        </span>
                        <span className="group-hover:text-[#FFCC00] transition-colors">
                          24/7 professional customer support
                        </span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-semibold mb-6 text-[#FFCC00]">
                    Trading Instruments
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-[#FFCC00]/50 transition-colors group">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="h-5 w-5 text-[#FFCC00] mr-2" />
                        <h4 className="font-medium group-hover:text-[#FFCC00] transition-colors">
                          Cryptocurrencies
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        Bitcoin, Ethereum, Litecoin, and more
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-[#FFCC00]/50 transition-colors group">
                      <div className="flex items-center mb-3">
                        <Globe className="h-5 w-5 text-[#FFCC00] mr-2" />
                        <h4 className="font-medium group-hover:text-[#FFCC00] transition-colors">
                          Forex
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        Major, minor and exotic currency pairs
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-[#FFCC00]/50 transition-colors group">
                      <div className="flex items-center mb-3">
                        <Shield className="h-5 w-5 text-[#FFCC00] mr-2" />
                        <h4 className="font-medium group-hover:text-[#FFCC00] transition-colors">
                          Indices
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        S&P 500, NASDAQ, FTSE 100, DAX
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-[#FFCC00]/50 transition-colors group">
                      <div className="flex items-center mb-3">
                        <Clock className="h-5 w-5 text-[#FFCC00] mr-2" />
                        <h4 className="font-medium group-hover:text-[#FFCC00] transition-colors">
                          Commodities
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        Gold, Silver, Oil, Natural Gas
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="py-16 bg-[#0a1929]">
            <div className="container mx-auto px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-white"
              >
                Live Currency Exchange Rates
              </motion.h2>
              <div className="mt-8 text-center">
                <Link href="/auth/signup">
                  <Button
                    variant="outline"
                    className="border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00]/10 px-8 py-4 rounded-lg transform hover:scale-105 transition-all"
                  >
                    View All Exchange Rates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="py-16 bg-gradient-to-b from-[#0a1929] to-black">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-[#1a2e44] to-[#0a1929] p-8 rounded-2xl border border-gray-800 hover:border-[#FFCC00]/50 transition-all transform hover:scale-105"
                >
                  <h3 className="text-2xl font-bold mb-4 text-[#FFCC00]">
                    Interactive Crypto CFDs
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Trade Bitcoin, Ethereum, and other popular cryptocurrencies
                    with leverage up to 1:5. Take advantage of both rising and
                    falling markets.
                  </p>
                  <Link href="/auth/signup">
                    <Button
                      variant="outline"
                      className="border-white/30 hover:border-[#FFCC00] text-white hover:text-[#FFCC00]"
                    >
                      Explore Crypto Trading
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-[#1a2e44] to-[#0a1929] p-8 rounded-2xl border border-gray-800 hover:border-[#FFCC00]/50 transition-all transform hover:scale-105"
                >
                  <h3 className="text-2xl font-bold mb-4 text-[#FFCC00]">
                    Options Specialists CFDs
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Trade options on stocks, indices, and commodities with our
                    specialized CFD platform. Perfect for advanced traders
                    looking for sophisticated strategies.
                  </p>
                  <Link href="/auth/signup">
                    <Button
                      variant="outline"
                      className="border-white/30 hover:border-[#FFCC00] text-white hover:text-[#FFCC00]"
                    >
                      Discover Options Trading
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* <InvestmentPlan /> */}
        </div>
      </main>
      <PriceTickerBar />
      <Footer />
    </div>
  );
}
