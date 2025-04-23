"use client";

import React, { useEffect, useState } from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/hooks/user/use-user";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getUserTransactionTotalsAction } from "@/services/actions/user-transaction-totals/user-transaction-totals.actions";

type ComponentProps = Record<string, never>;

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  description?: string;
  created_at: string;
}

const TransactionsPage: React.FC<ComponentProps> = () => {
  const router = useRouter();
  const { profile } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState({
    totalTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadData = async () => {
      if (!profile) return;

      try {
        // Fetch transaction history
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("transaction_history")
            .select("*")
            .eq("userId", profile.id)
            .order("created_at", { ascending: false });

        if (transactionsError) throw transactionsError;

        // Fetch stored totals
        const storedTotals = await getUserTransactionTotalsAction(profile.id);

        // Calculate totals
        const deposits =
          transactionsData?.filter(
            (t) => t.type === "deposit" && t.status === "completed"
          ) || [];
        const withdrawals =
          transactionsData?.filter(
            (t) => t.type === "withdrawal" && t.status === "completed"
          ) || [];

        setTotals({
          totalTransactions: storedTotals?.find(
            (t) => t.type === "transactions"
          )?.amount
            ? parseFloat(
                storedTotals.find((t) => t.type === "transactions")?.amount ||
                  "0"
              )
            : transactionsData?.length || 0,
          totalDeposits: storedTotals?.find((t) => t.type === "deposits")
            ?.amount
            ? parseFloat(
                storedTotals.find((t) => t.type === "deposits")?.amount || "0"
              )
            : deposits.reduce((sum, t) => sum + (t.amount || 0), 0),
          totalWithdrawals: storedTotals?.find((t) => t.type === "withdrawals")
            ?.amount
            ? parseFloat(
                storedTotals.find((t) => t.type === "withdrawals")?.amount ||
                  "0"
              )
            : withdrawals.reduce((sum, t) => sum + (t.amount || 0), 0),
        });

        setTransactions(transactionsData || []);
      } catch (error) {
        console.error("Error loading transaction data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profile, supabase]);

  return (
    <Block>
      <BlockBody>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">Transactions</h2>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : totals.totalTransactions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">
                ${isLoading ? "..." : totals.totalDeposits.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                ${isLoading ? "..." : totals.totalWithdrawals.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === "deposit"
                              ? "success"
                              : transaction.type === "withdrawal"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No transactions found.
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

export default TransactionsPage;
