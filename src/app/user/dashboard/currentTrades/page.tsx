"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Block, { BlockBody } from "@/components/templates/block";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUp,
  ArrowDown,
  Send,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Script from "next/script";

// Define coin data type
interface CoinData {
  id: number;
  symbol: string;
  price: string;
  change: string;
  direction: "up" | "down";
  volume: string;
  high24h: string;
  low24h: string;
}

// Sample market data
const marketData: CoinData[] = [
  {
    id: 1,
    symbol: "BTC/USD",
    price: "69420.50",
    change: "+2.5%",
    direction: "up",
    volume: "5.2B",
    high24h: "69850.25",
    low24h: "67400.75",
  },
  {
    id: 2,
    symbol: "ETH/USD",
    price: "3950.75",
    change: "+1.8%",
    direction: "up",
    volume: "1.8B",
    high24h: "4050.30",
    low24h: "3850.20",
  },
  {
    id: 3,
    symbol: "SOL/USD",
    price: "137.25",
    change: "-0.5%",
    direction: "down",
    volume: "620M",
    high24h: "142.30",
    low24h: "135.80",
  },
  {
    id: 4,
    symbol: "XRP/USD",
    price: "0.5732",
    change: "+3.2%",
    direction: "up",
    volume: "380M",
    high24h: "0.5920",
    low24h: "0.5510",
  },
  {
    id: 5,
    symbol: "ADA/USD",
    price: "0.5201",
    change: "-1.2%",
    direction: "down",
    volume: "240M",
    high24h: "0.5340",
    low24h: "0.5150",
  },
  {
    id: 6,
    symbol: "DOGE/USD",
    price: "0.1432",
    change: "+5.7%",
    direction: "up",
    volume: "420M",
    high24h: "0.1480",
    low24h: "0.1320",
  },
];

// Sample chat messages for trading
const initialChatMessages = [
  {
    id: 1,
    user: "TradingPro",
    message: "BTC looking bullish today, expecting a break above 70k",
    time: "10:23 AM",
  },
  {
    id: 2,
    user: "CryptoWhale",
    message: "I'm going long on ETH, the merge effects are still being felt",
    time: "10:25 AM",
  },
  {
    id: 3,
    user: "Analyst42",
    message:
      "SOL experiencing some resistance at 140, might consolidate before next leg up",
    time: "10:28 AM",
  },
  {
    id: 4,
    user: "System",
    message: "BTC just broke 69,500! New ATH incoming?",
    time: "10:30 AM",
  },
  {
    id: 5,
    user: "TradingPro",
    message: "Watch for a potential BTC retrace to 68k before continuing up",
    time: "10:32 AM",
  },
];

// Sample trading positions
const tradingPositions = [
  {
    id: 1,
    symbol: "BTC/USD",
    type: "Long",
    entryPrice: "65750.00",
    currentPrice: "69420.50",
    profit: "+5.58%",
    amount: "0.15 BTC",
  },
  {
    id: 2,
    symbol: "ETH/USD",
    type: "Long",
    entryPrice: "3800.25",
    currentPrice: "3950.75",
    profit: "+3.96%",
    amount: "2.5 ETH",
  },
];

export default function CurrentTradesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [selectedCoin, setSelectedCoin] = useState(marketData[0]);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [messageInput, setMessageInput] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-scroll chat to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;

    const newMessage = {
      id: chatMessages.length + 1,
      user: "You",
      message: messageInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageInput("");

    // Simulate response after sending message
    setTimeout(() => {
      const responses = [
        "Interesting perspective on the market.",
        "I agree with your analysis.",
        "The support level at 68.5k seems strong.",
        "Volume is picking up, could signal a breakout soon.",
        "Watch the RSI, it's approaching overbought territory.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const responseMessage = {
        id: chatMessages.length + 2,
        user: "TradingPro",
        message: randomResponse,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSymbolSelect = (symbol: string, coin: CoinData) => {
    setSelectedCoin(coin);

    switch (symbol) {
      case "BTC/USD":
        setSelectedSymbol("BINANCE:BTCUSDT");
        break;
      case "ETH/USD":
        setSelectedSymbol("BINANCE:ETHUSDT");
        break;
      case "SOL/USD":
        setSelectedSymbol("BINANCE:SOLUSDT");
        break;
      case "XRP/USD":
        setSelectedSymbol("BINANCE:XRPUSDT");
        break;
      case "ADA/USD":
        setSelectedSymbol("BINANCE:ADAUSDT");
        break;
      case "DOGE/USD":
        setSelectedSymbol("BINANCE:DOGEUSDT");
        break;
      default:
        setSelectedSymbol("BINANCE:BTCUSDT");
    }

    // Add a system message about selecting this coin
    const systemMessage = {
      id: chatMessages.length + 1,
      user: "System",
      message: `${symbol} selected - Current price: $${coin.price}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prevMessages) => [...prevMessages, systemMessage]);
  };

  const handleTrade = (tradeType: "buy" | "sell") => {
    if (!buyAmount) return;

    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Create system message for the trade
    const systemMessage = {
      id: chatMessages.length + 1,
      user: "System",
      message: `${tradeType === "buy" ? "Buy" : "Sell"} order placed: ${amount} ${selectedCoin.symbol} at $${selectedCoin.price}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prevMessages) => [...prevMessages, systemMessage]);
    setBuyAmount("");

    // Simulated response from trading expert
    setTimeout(() => {
      const responses =
        tradeType === "buy"
          ? [
              `Good entry on ${selectedCoin.symbol.split("/")[0]}, the momentum is picking up.`,
              `Nice buy, volume has been increasing on ${selectedCoin.symbol}.`,
              `${selectedCoin.symbol.split("/")[0]} looking strong, good entry point.`,
            ]
          : [
              `Taking profits on ${selectedCoin.symbol.split("/")[0]} is smart at these levels.`,
              `${selectedCoin.symbol.split("/")[0]} might retest support soon, good sell.`,
              `Locking in profits is always a good strategy!`,
            ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const responseMessage = {
        id: chatMessages.length + 2,
        user: "CryptoWhale",
        message: randomResponse,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 1500);
  };

  if (loading) {
    return (
      <Block>
        <BlockBody>
          <div className="mb-6">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[500px] col-span-2 rounded-lg" />
            <Skeleton className="h-[500px] rounded-lg" />
          </div>
        </BlockBody>
      </Block>
    );
  }

  return (
    <Block>
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="afterInteractive"
      />
      <BlockBody>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Current Trades</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your positions and trade cryptocurrencies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on desktop */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* TradingView Widget */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Live Trading Chart:{" "}
                  {selectedSymbol
                    .replace("BINANCE:", "")
                    .replace("USDT", "/USDT")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-sm font-semibold ${selectedCoin.direction === "up" ? "text-green-600" : "text-red-600"}`}
                  >
                    ${selectedCoin.price} {selectedCoin.change}
                    {selectedCoin.direction === "up" ? (
                      <TrendingUp className="h-4 w-4 inline ml-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 inline ml-1" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[400px] p-0">
                <div
                  id="tradingview_widget_container"
                  className="h-full w-full"
                >
                  <div
                    id="tradingview_chart"
                    className="h-full w-full"
                    dangerouslySetInnerHTML={{
                      __html: `
                        <div class="tradingview-widget-container" style="height:100%">
                          <div id="tradingview_chart_container" style="height:100%;width:100%"></div>
                          <script type="text/javascript">
                            document.addEventListener('DOMContentLoaded', function() {
                              new TradingView.widget({
                                autosize: true,
                                symbol: "${selectedSymbol}",
                                interval: "15",
                                timezone: "Etc/UTC",
                                theme: "dark",
                                style: "1",
                                locale: "en",
                                toolbar_bg: "#f1f3f6",
                                enable_publishing: false,
                                withdateranges: true,
                                hide_side_toolbar: false,
                                allow_symbol_change: true,
                                save_image: false,
                                studies: ["RSI@tv-basicstudies"],
                                container_id: "tradingview_chart_container"
                              });
                            });
                          </script>
                        </div>
                      `,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Trading Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {tradingPositions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Symbol</th>
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-left py-3 px-4">Entry Price</th>
                          <th className="text-left py-3 px-4">Current Price</th>
                          <th className="text-left py-3 px-4">Amount</th>
                          <th className="text-right py-3 px-4">Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tradingPositions.map((position) => (
                          <tr key={position.id} className="border-b">
                            <td className="py-3 px-4 font-medium">
                              {position.symbol}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${position.type === "Long" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                              >
                                {position.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              ${position.entryPrice}
                            </td>
                            <td className="py-3 px-4">
                              ${position.currentPrice}
                            </td>
                            <td className="py-3 px-4">{position.amount}</td>
                            <td
                              className={`py-3 px-4 text-right ${position.profit.startsWith("+") ? "text-green-600" : "text-red-600"} font-medium`}
                            >
                              {position.profit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No active trading positions
                    </p>
                    <Button className="mt-4">Open New Position</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {marketData.map((coin) => (
                    <div
                      key={coin.id}
                      className={`flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer ${
                        selectedCoin.id === coin.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSymbolSelect(coin.symbol, coin)}
                    >
                      <div className="font-medium">{coin.symbol}</div>
                      <div className="flex items-center gap-2">
                        <div>${coin.price}</div>
                        <div
                          className={
                            coin.direction === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {coin.direction === "up" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={
                            coin.direction === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {coin.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trade {selectedCoin.symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        24h High
                      </p>
                      <p className="font-medium">${selectedCoin.high24h}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        24h Low
                      </p>
                      <p className="font-medium">${selectedCoin.low24h}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Volume
                      </p>
                      <p className="font-medium">${selectedCoin.volume}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Change
                      </p>
                      <p
                        className={`font-medium ${selectedCoin.direction === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {selectedCoin.change}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Amount</p>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="number"
                        placeholder={`Amount in ${selectedCoin.symbol.split("/")[0]}`}
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleTrade("buy")}
                      >
                        Buy
                      </Button>
                      <Button
                        variant="default"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleTrade("sell")}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] flex flex-col">
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${msg.user === "You" ? "justify-end" : ""}`}
                      >
                        {msg.user !== "You" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                            {msg.user.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] ${msg.user === "System" ? "bg-muted w-full text-center py-2" : msg.user === "You" ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
                        >
                          {msg.user !== "You" && msg.user !== "System" && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs">
                                {msg.user}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {msg.time}
                              </span>
                            </div>
                          )}
                          <p
                            className={`text-sm ${msg.user === "System" ? "text-muted-foreground font-medium" : ""}`}
                          >
                            {msg.message}
                          </p>
                          {msg.user === "You" && (
                            <div className="flex justify-end mt-1">
                              <span className="text-[10px] text-primary-foreground/70">
                                {msg.time}
                              </span>
                            </div>
                          )}
                        </div>
                        {msg.user === "You" && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-white">
                            Y
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      placeholder="Type your message here..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground">Portfolio Value</div>
                    <div className="font-semibold">$24,785.32</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground">
                      Available Balance
                    </div>
                    <div className="font-semibold">$12,430.81</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground">
                      Total Profit/Loss
                    </div>
                    <div className="font-semibold text-green-600">
                      +$3,254.51 (15.12%)
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full">Deposit Funds</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </BlockBody>
    </Block>
  );
}
