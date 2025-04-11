"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Copy, Check, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface PaymentMethod {
  id: string;
  type: "bank" | "crypto";
  name: string;
  details: Record<string, string>;
  is_active: boolean;
}

interface Transaction {
  id: string;
  status: "pending" | "approved" | "declined";
  amount: number;
  created_at: string;
  payment_method: PaymentMethod;
  proof_of_payment?: string;
  payment_reference?: string;
}

export const DepositHistory = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [proofOfPayment, setProofOfPayment] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
    loadTransactions();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          payment_method:payment_methods(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: "Payment details copied to clipboard.",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard.",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}_${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `payment_proofs/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("payment_proofs")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage
        .from("payment_proofs")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload proof of payment image.",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitPayment = async () => {
    try {
      setSubmitting(true);
      const selectedPlanStr = localStorage.getItem("selectedPlan");
      if (!selectedPlanStr) {
        throw new Error("No plan selected");
      }

      let selectedPlan;
      try {
        selectedPlan = JSON.parse(selectedPlanStr);
      } catch {
        throw new Error("Invalid plan data");
      }

      if (!selectedPlan?.id || !selectedPlan?.price) {
        throw new Error("Invalid plan data");
      }

      if (!selectedMethod) {
        throw new Error("Please select a payment method");
      }

      if (!proofOfPayment && !imageFile) {
        throw new Error("Please provide proof of payment (image or reference)");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image if available
      let proofImageUrl = null;
      if (imageFile) {
        proofImageUrl = await uploadImage();
        if (!proofImageUrl && !proofOfPayment) {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // Create the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            plan_id: selectedPlan.id,
            payment_method_id: selectedMethod.id,
            amount: selectedPlan.price,
            proof_of_payment: proofImageUrl || proofOfPayment,
            payment_reference: paymentReference,
          },
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create notification for admin
      await supabase.from("admin_notifications").insert([
        {
          user_id: user.id,
          message: `New payment of $${selectedPlan.price} for ${selectedPlan.name} plan`,
          type: "new_transaction",
          is_read: false,
        },
      ]);

      toast({
        title: "Success",
        description:
          "Payment submitted successfully. Please wait for admin approval.",
      });

      // Clear the selected plan and form
      localStorage.removeItem("selectedPlan");
      await loadTransactions();
      setSelectedMethod(null);
      setProofOfPayment("");
      setPaymentReference("");
      setImageFile(null);
      setImagePreview(null);

      // Redirect to transactions tab or refresh the page
      router.refresh();
    } catch (error: Error | unknown) {
      console.error("Error submitting payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit payment. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  const bankMethods = paymentMethods.filter((method) => method.type === "bank");
  const cryptoMethods = paymentMethods.filter(
    (method) => method.type === "crypto"
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bank" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
              <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            </TabsList>

            <TabsContent value="bank">
              {bankMethods.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No bank transfer methods available.
                </p>
              ) : (
                <div className="space-y-4">
                  {bankMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-colors ${
                        selectedMethod?.id === method.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedMethod(method)}
                    >
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">{method.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4 p-2 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Bank Name
                              </p>
                              <p className="font-medium">
                                {method.details.bankName}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  method.details.bankName,
                                  `bank-${method.id}`
                                );
                              }}
                            >
                              {copiedField === `bank-${method.id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-4 p-2 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Account Number
                              </p>
                              <p className="font-medium">
                                {method.details.accountNumber}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  method.details.accountNumber,
                                  `account-${method.id}`
                                );
                              }}
                            >
                              {copiedField === `account-${method.id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-4 p-2 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Account Name
                              </p>
                              <p className="font-medium">
                                {method.details.accountName}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  method.details.accountName,
                                  `name-${method.id}`
                                );
                              }}
                            >
                              {copiedField === `name-${method.id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="crypto">
              {cryptoMethods.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No cryptocurrency payment methods available.
                </p>
              ) : (
                <div className="space-y-4">
                  {cryptoMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-colors ${
                        selectedMethod?.id === method.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedMethod(method)}
                    >
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">{method.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4 p-2 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Network
                              </p>
                              <p className="font-medium">
                                {method.details.network}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  method.details.network,
                                  `network-${method.id}`
                                );
                              }}
                            >
                              {copiedField === `network-${method.id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-4 p-2 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Wallet Address
                              </p>
                              <p className="font-medium break-all">
                                {method.details.address}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  method.details.address,
                                  `address-${method.id}`
                                );
                              }}
                            >
                              {copiedField === `address-${method.id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {selectedMethod && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proofOfPayment">Proof of Payment</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Upload Screenshot
                    </Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="proofImage"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                      />
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Payment proof"
                            className="mx-auto max-h-48 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">
                            Click to upload proof of payment
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG or GIF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      OR Provide Reference
                    </Label>
                    <Input
                      id="proofOfPayment"
                      placeholder="Enter transaction ID or reference number"
                      value={proofOfPayment}
                      onChange={(e) => setProofOfPayment(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can provide a transaction ID if you don't have a
                      screenshot
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentReference">
                  Additional Information (Optional)
                </Label>
                <Input
                  id="paymentReference"
                  placeholder="Enter any additional reference or notes"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmitPayment}
                disabled={
                  submitting ||
                  uploadingImage ||
                  (!proofOfPayment && !imageFile)
                }
              >
                {submitting || uploadingImage
                  ? "Processing..."
                  : "Submit Payment"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">${transaction.amount}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      transaction.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : transaction.status === "declined"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No transactions yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
