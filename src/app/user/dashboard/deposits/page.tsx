"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Block, { BlockBody } from "@/components/templates/block";
import { Skeleton } from "@/components/ui/skeleton";

// You can change this Bitcoin address to your own
const BITCOIN_ADDRESS = "11BLE7XYZJkCkmi8qWGBaRobJ6xAqact8U";

// Change this to your company's email address
const COMPANY_EMAIL = "payments@yourcompany.com";

export default function DepositsPage() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Get the plan information from localStorage if available
  const [amount, setAmount] = useState("10000");
  const [planName, setPlanName] = useState("Premium");

  useEffect(() => {
    // Set a short loading state for UI consistency
    setTimeout(() => setLoading(false), 500);

    const storedPlan = localStorage.getItem("selectedPlan");
    if (storedPlan) {
      try {
        const plan = JSON.parse(storedPlan);
        if (plan.price) {
          setAmount(plan.price.toString());
        }
        if (plan.name) {
          setPlanName(plan.name);
        }
      } catch (e) {
        console.error("Error parsing stored plan", e);
      }
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(BITCOIN_ADDRESS);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Bitcoin address copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard.",
      });
    }
  };

  const handleCompleted = () => {
    // Format the email subject and body
    const subject = `Bitcoin Payment Confirmation - ${planName} Plan ($${amount})`;
    const body = `
Hello,

I have completed my Bitcoin payment for the ${planName} Plan ($${amount}).

Bitcoin Address: ${BITCOIN_ADDRESS}
Amount: $${amount} USD
Plan: ${planName}

I have attached a screenshot of my payment confirmation.

Thank you,
[Your Name]
    `.trim();

    // Create the mailto link with subject and body
    const mailtoLink = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the user's email client
    window.open(mailtoLink, "_blank");

    toast({
      title: "Email Opened",
      description: "Please attach your payment screenshot and send the email.",
    });
  };

  if (loading) {
    return (
      <Block>
        <BlockBody>
          <div className="mb-6">
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[400px] rounded-lg" />
        </BlockBody>
      </Block>
    );
  }

  return (
    <Block>
      <BlockBody>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              DEPOSIT FUNDS
            </h1>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p>Available Credit: ${amount} USD</p>
              {planName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected Plan: {planName}
                </p>
              )}
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="mb-4">
                You are to make payment of{" "}
                <span className="font-bold">${amount} USD</span> for the{" "}
                <span className="font-bold">{planName}</span> plan using Bitcoin
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500">🔒</span>
                <span>Bitcoin Address: </span>
                <span className="font-semibold">{BITCOIN_ADDRESS}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-8 w-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="bg-blue-700 text-white p-4 rounded-md mb-4">
                <p className="font-semibold mb-2">INSTRUCTIONS:</p>
                <p className="mb-2">
                  Transfer the amount of Bitcoin you want to deposit to the
                  above wallet address and click the Completed Button below.
                </p>
                <p>
                  You will be automatically credited when we receive your
                  payment. You will also receive a notification mail when your
                  transaction has been received.
                </p>
              </div>

              <div className="bg-red-500 text-white p-4 rounded-md mb-6">
                <p className="font-semibold">WARNING:</p>
                <p>
                  Minimum payment is 0.0005 BTC, any Bitcoin sent below this
                  amount will not reflect in your wallet.
                </p>
              </div>

              <div className="text-center">
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg"
                  onClick={handleCompleted}
                >
                  Completed - Send Payment Proof
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </BlockBody>
    </Block>
  );
}
