"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Database } from "@/types/supabase";

interface RawTransaction {
  id: string;
  user_id: string;
  plan_id: string;
  payment_method_id: string;
  amount: number;
  status: "pending" | "approved" | "declined";
  proof_of_payment: string | null;
  payment_reference: string | null;
  created_at: string;
  user: { email: string } | null;
  plan: {
    name: string;
    returnPercentage?: number;
    bonusAmount?: number;
    duration?: number;
  } | null;
  payment_method: {
    name: string;
    type: string;
  } | null;
}

interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  payment_method_id: string;
  amount: number;
  status: "pending" | "approved" | "declined";
  proof_of_payment: string | null;
  payment_reference: string | null;
  created_at: string;
  user: {
    email: string;
  } | null;
  plan: {
    name: string;
    returnPercentage?: number;
    bonusAmount?: number;
    duration?: number;
  } | null;
  payment_method: {
    name: string;
    type: string;
  } | null;
}

interface UserAccount {
  user_id: string;
  balance: number;
  bonus: number;
  earnings: number;
}

export const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [viewProofDialog, setViewProofDialog] = useState(false);
  const [updateBalanceDialog, setUpdateBalanceDialog] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          user:auth.users(email),
          plan:plans(name, returnPercentage, bonusAmount, duration),
          payment_method:payment_methods(name, type)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Double cast through unknown to safely handle the type conversion
      const typedData = (data || []) as unknown as RawTransaction[];
      setTransactions(
        typedData.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          plan_id: item.plan_id,
          payment_method_id: item.payment_method_id,
          amount: item.amount,
          status: item.status,
          proof_of_payment: item.proof_of_payment,
          payment_reference: item.payment_reference,
          created_at: item.created_at,
          user: item.user,
          plan: item.plan,
          payment_method: item.payment_method,
        }))
      );
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transactions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserAccount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Account doesn't exist, create a new one
          return {
            user_id: userId,
            balance: 0,
            bonus: 0,
            earnings: 0,
          };
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user account details.",
      });
      return null;
    }
  };

  const handleUpdateStatus = async (
    transaction: Transaction,
    status: "approved" | "declined"
  ) => {
    try {
      setProcessingAction(true);

      // If approving, get user account to update balance
      if (status === "approved") {
        const account = await getUserAccount(transaction.user_id);
        setUserAccount(account);
        setSelectedTransaction(transaction);
        setUpdateBalanceDialog(true);
        setProcessingAction(false);
        return;
      }

      // If declining, just update the status
      const { error } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", transaction.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Transaction ${status} successfully.`,
      });

      // Reload transactions to get updated data
      await loadTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update transaction status.",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const finalizeApproval = async () => {
    if (!selectedTransaction || !userAccount) return;

    try {
      setProcessingAction(true);

      // 1. Update transaction status
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({ status: "approved" })
        .eq("id", selectedTransaction.id);

      if (transactionError) throw transactionError;

      // 2. Update user account (update existing or insert new)
      const { error: accountError } = await supabase.from("accounts").upsert({
        user_id: userAccount.user_id,
        balance: userAccount.balance,
        bonus: userAccount.bonus,
        earnings: userAccount.earnings,
        updated_at: new Date().toISOString(),
      });

      if (accountError) throw accountError;

      toast({
        title: "Success",
        description:
          "Transaction approved and user account updated successfully.",
      });

      // Close dialog and reload
      setUpdateBalanceDialog(false);
      await loadTransactions();
    } catch (error) {
      console.error("Error finalizing approval:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve transaction and update user account.",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const viewProofOfPayment = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewProofDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.user?.email}</TableCell>
                  <TableCell>{transaction.plan?.name}</TableCell>
                  <TableCell>${transaction.amount}</TableCell>
                  <TableCell>
                    {transaction.payment_method?.name}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({transaction.payment_method?.type})
                    </span>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {transaction.proof_of_payment ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewProofOfPayment(transaction)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    ) : (
                      "No proof"
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex items-center"
                          onClick={() =>
                            handleUpdateStatus(transaction, "approved")
                          }
                          disabled={processingAction}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex items-center"
                          onClick={() =>
                            handleUpdateStatus(transaction, "declined")
                          }
                          disabled={processingAction}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Proof Dialog */}
      <Dialog open={viewProofDialog} onOpenChange={setViewProofDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Proof of Payment</DialogTitle>
            <DialogDescription>
              Transaction from {selectedTransaction?.user?.email} for $
              {selectedTransaction?.amount}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction?.proof_of_payment?.startsWith("http") ? (
            // It's an image URL
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={selectedTransaction.proof_of_payment}
                  alt="Proof of payment"
                  className="max-w-full h-auto max-h-[400px]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://placehold.co/400x300?text=Error+Loading+Image";
                  }}
                />
              </div>
              <a
                href={selectedTransaction.proof_of_payment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
            </div>
          ) : (
            // It's a text reference
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Payment Reference:</p>
              <p className="mt-1">
                {selectedTransaction?.proof_of_payment ||
                  "No reference provided"}
              </p>
              {selectedTransaction?.payment_reference && (
                <>
                  <p className="font-medium mt-4">Additional Notes:</p>
                  <p className="mt-1">
                    {selectedTransaction.payment_reference}
                  </p>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            {selectedTransaction?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewProofDialog(false);
                    if (selectedTransaction) {
                      handleUpdateStatus(selectedTransaction, "declined");
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  onClick={() => {
                    setViewProofDialog(false);
                    if (selectedTransaction) {
                      handleUpdateStatus(selectedTransaction, "approved");
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Balance Update Dialog */}
      <Dialog open={updateBalanceDialog} onOpenChange={setUpdateBalanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Account</DialogTitle>
            <DialogDescription>
              Adjust user balance and bonuses before approving the transaction
            </DialogDescription>
          </DialogHeader>

          {userAccount && selectedTransaction && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={userAccount.balance + selectedTransaction.amount}
                    onChange={(e) =>
                      setUserAccount({
                        ...userAccount,
                        balance:
                          parseFloat(e.target.value) -
                          selectedTransaction.amount,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    New balance after transaction: $
                    {userAccount.balance + selectedTransaction.amount}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={
                      userAccount.bonus +
                      (selectedTransaction.plan?.bonusAmount || 0)
                    }
                    onChange={(e) =>
                      setUserAccount({
                        ...userAccount,
                        bonus:
                          parseFloat(e.target.value) -
                          (selectedTransaction.plan?.bonusAmount || 0),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    New bonus after transaction: $
                    {userAccount.bonus +
                      (selectedTransaction.plan?.bonusAmount || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="earnings">Potential Earnings</Label>
                <Input
                  id="earnings"
                  type="number"
                  value={
                    userAccount.earnings +
                    (selectedTransaction.amount *
                      (selectedTransaction.plan?.returnPercentage || 0)) /
                      100
                  }
                  onChange={(e) =>
                    setUserAccount({
                      ...userAccount,
                      earnings:
                        parseFloat(e.target.value) -
                        (selectedTransaction.amount *
                          (selectedTransaction.plan?.returnPercentage || 0)) /
                          100,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Expected return: $
                  {(selectedTransaction.amount *
                    (selectedTransaction.plan?.returnPercentage || 0)) /
                    100}
                  ({selectedTransaction.plan?.returnPercentage || 0}% of $
                  {selectedTransaction.amount})
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg mt-4">
                <h4 className="font-medium">Transaction Summary:</h4>
                <ul className="space-y-1 mt-2 text-sm">
                  <li>User: {selectedTransaction.user?.email}</li>
                  <li>Plan: {selectedTransaction.plan?.name}</li>
                  <li>Amount: ${selectedTransaction.amount}</li>
                  <li>
                    Duration: {selectedTransaction.plan?.duration || 0} days
                  </li>
                  <li>
                    Return: {selectedTransaction.plan?.returnPercentage || 0}%
                  </li>
                  <li>Bonus: ${selectedTransaction.plan?.bonusAmount || 0}</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateBalanceDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={finalizeApproval} disabled={processingAction}>
              {processingAction ? "Processing..." : "Approve & Update Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
