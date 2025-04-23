"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Block, { BlockBody } from "@/components/templates/block";
import { Skeleton } from "@/components/ui/skeleton";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  type: "CRYPTO" | "BANK";
  enabled: boolean;
  details: {
    address?: string;
    network?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
}

// You can change this Bitcoin address to your own
// const BITCOIN_ADDRESS = "11BLE7XYZJkCkmi8qWGBaRobJ6xAqact8U";

// Change this to your company's email address
// const COMPANY_EMAIL = "payments@yourcompany.com";

export default function DepositsPage() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const { toast } = useToast();
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_PROJECT_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  // Get the plan information from localStorage if available
  const [amount, setAmount] = useState("10000");
  const [planName, setPlanName] = useState("Premium");

  const loadPaymentMethods = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("enabled", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
      if (data && data.length > 0) {
        setSelectedMethod(data[0]);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment methods",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    loadPaymentMethods();
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
  }, [loadPaymentMethods]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard.",
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
    const subject = `Payment Confirmation - ${planName} Plan ($${amount})`;
    const body = `
Hello,

I have completed my payment for the ${planName} Plan ($${amount}).

Payment Method: ${selectedMethod?.name}
${selectedMethod?.type === "CRYPTO" ? `Address: ${selectedMethod?.details.address}` : `Bank Details: ${selectedMethod?.details.bankName} - ${selectedMethod?.details.accountNumber}`}
Amount: $${amount} USD
Plan: ${planName}

I have attached a screenshot of my payment confirmation.

Thank you,
[Your Name]
    `.trim();

    // Create the mailto link with subject and body
    const mailtoLink = `mailto:payments@yourcompany.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-gray-100">
                Available Credit: ${amount} USD
              </p>
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
                <span className="font-bold">{planName}</span> plan
              </p>

              <Tabs defaultValue="crypto" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="crypto">
                  {paymentMethods
                    .filter((method) => method.type === "CRYPTO")
                    .map((method) => (
                      <div key={method.id} className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-yellow-500">🔒</span>
                          <span>Wallet Address: </span>
                          <span className="font-semibold">
                            {method.details.address}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(method.details.address || "")
                            }
                            className="h-8 w-8"
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Network: {method.details.network}
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="bank">
                  {paymentMethods
                    .filter((method) => method.type === "BANK")
                    .map((method) => (
                      <div key={method.id} className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span>Bank Name: </span>
                            <span className="font-semibold">
                              {method.details.bankName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Account Name: </span>
                            <span className="font-semibold">
                              {method.details.accountName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Account Number: </span>
                            <span className="font-semibold">
                              {method.details.accountNumber}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                copyToClipboard(
                                  method.details.accountNumber || ""
                                )
                              }
                              className="h-8 w-8"
                            >
                              {copied ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>

              <div className="bg-blue-700 text-white p-4 rounded-md mb-4">
                <p className="font-semibold mb-2">INSTRUCTIONS:</p>
                <p className="mb-2">
                  Transfer the amount to the provided details and click the
                  Completed Button below.
                </p>
                <p>
                  You will be automatically credited when we receive your
                  payment. You will also receive a notification mail when your
                  transaction has been received.
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
