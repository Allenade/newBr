"use client";

import React, { useState, useEffect } from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/hooks/user/use-user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  createWithdrawalAction,
  getUserWithdrawalsAction,
} from "@/services/actions/withdrawal/withdrawal.actions";
import {
  withdrawals,
  withdrawalMethod,
} from "@/services/db/schema/withdrawals.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CryptoDetails = {
  cryptoCurrency: string;
  cryptoAddress: string;
  cryptoNetwork: string;
};

const WithdrawalsPage = () => {
  const { profile, profileIsLoading } = useUser();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<
    (typeof withdrawals.$inferSelect)[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Withdrawal method and details
  const [method, setMethod] =
    useState<(typeof withdrawalMethod.enumValues)[number]>("bank_transfer");
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [cryptoDetails, setCryptoDetails] = useState<CryptoDetails>({
    cryptoCurrency: "",
    cryptoAddress: "",
    cryptoNetwork: "",
  });

  useEffect(() => {
    const loadWithdrawalHistory = async () => {
      if (profile?.id) {
        try {
          const history = await getUserWithdrawalsAction(profile.id);
          setWithdrawalHistory(history);
        } catch (error) {
          console.error("Failed to load withdrawal history:", error);
          toast.error("Failed to load withdrawal history");
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    loadWithdrawalHistory();
  }, [profile?.id]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      toast.error("User profile not found");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) > (profile?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);
    try {
      const withdrawal = await createWithdrawalAction(
        profile.id,
        Number(amount),
        profile.currency,
        {
          method,
          bankDetails: method === "bank_transfer" ? bankDetails : undefined,
          cryptoDetails: method === "crypto" ? cryptoDetails : undefined,
        }
      );

      if (withdrawal) {
        setWithdrawalHistory((prev) => [withdrawal, ...prev]);
      }

      toast.success("Withdrawal request submitted successfully");
      setAmount("");
      // Reset form
      setMethod("bank_transfer");
      setBankDetails({ bankName: "", accountNumber: "", accountName: "" });
      setCryptoDetails({
        cryptoCurrency: "",
        cryptoAddress: "",
        cryptoNetwork: "",
      });
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to submit withdrawal request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "declined":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Block>
      <BlockBody>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/user/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-bold">Withdrawals</h2>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Available Balance: $
              {profileIsLoading ? "..." : (profile?.balance || 0).toFixed(2)}{" "}
              {profile?.currency || "USD"}
            </p>
          </div>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="method">Withdrawal Method</Label>
              <Select
                value={method}
                onValueChange={(value) =>
                  setMethod(
                    value as (typeof withdrawalMethod.enumValues)[number]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === "bank_transfer" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankDetails.bankName}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        bankName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        accountNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={bankDetails.accountName}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        accountName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="cryptoCurrency">Cryptocurrency</Label>
                  <Input
                    id="cryptoCurrency"
                    placeholder="e.g., BTC, ETH, USDT, USDC, BNB, etc."
                    value={cryptoDetails.cryptoCurrency}
                    onChange={(e) =>
                      setCryptoDetails({
                        ...cryptoDetails,
                        cryptoCurrency: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Please specify the cryptocurrency you want to receive (e.g.,
                    BTC, ETH, USDT, USDC, BNB, etc.)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cryptoAddress">Wallet Address</Label>
                  <Input
                    id="cryptoAddress"
                    value={cryptoDetails.cryptoAddress}
                    onChange={(e) =>
                      setCryptoDetails({
                        ...cryptoDetails,
                        cryptoAddress: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cryptoNetwork">Network</Label>
                  <Input
                    id="cryptoNetwork"
                    placeholder="e.g., ERC20, BEP20, TRC20, Polygon, Solana, etc."
                    value={cryptoDetails.cryptoNetwork}
                    onChange={(e) =>
                      setCryptoDetails({
                        ...cryptoDetails,
                        cryptoNetwork: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Please specify the exact network you want to receive on
                    (e.g., ERC20, BEP20, TRC20, Polygon, Solana, etc.)
                  </p>
                </div>
              </>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Request Withdrawal"}
            </Button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingHistory ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : withdrawalHistory.length > 0 ? (
                  withdrawalHistory.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        ${withdrawal.amount.toFixed(2)} {withdrawal.currency}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="capitalize">
                            {withdrawal.method}
                          </span>
                          {withdrawal.method === "crypto" && (
                            <span className="text-sm text-gray-500">
                              {withdrawal.cryptoCurrency} (
                              {withdrawal.cryptoNetwork})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(withdrawal.status)}
                        >
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No withdrawal history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </BlockBody>
    </Block>
  );
};

export default WithdrawalsPage;
