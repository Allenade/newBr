"use client";

import React, { useState, useEffect } from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getAllWithdrawalsAction,
  updateWithdrawalStatusAction,
} from "@/services/actions/withdrawal/withdrawal.actions";
import {
  withdrawalStatus,
  withdrawalMethod,
} from "@/services/db/schema/withdrawals.schema";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { getProfileAction } from "@/services/actions/profile/profile.actions";

type Withdrawal = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: (typeof withdrawalMethod.enumValues)[number];
  status: (typeof withdrawalStatus.enumValues)[number];
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  cryptoCurrency: string | null;
  cryptoAddress: string | null;
  cryptoNetwork: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

// Add a type for user profile
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
}

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [userHistory, setUserHistory] = useState<Withdrawal[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    loadWithdrawals();
  }, []);

  // Fetch user profiles for all withdrawals
  useEffect(() => {
    const fetchProfiles = async () => {
      const uniqueUserIds = Array.from(
        new Set(withdrawals.map((w) => w.userId))
      );
      const profilesObj: Record<string, UserProfile> = {};
      for (const userId of uniqueUserIds) {
        if (!userProfiles[userId]) {
          try {
            const profile = await getProfileAction(userId);
            if (profile) {
              profilesObj[userId] = profile;
            }
          } catch {}
        }
      }
      setUserProfiles((prev) => ({ ...prev, ...profilesObj }));
    };
    if (withdrawals.length > 0) fetchProfiles();
  }, [withdrawals]);

  // Fetch user withdrawal history when viewing details
  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedWithdrawal) {
        try {
          const history = await getAllWithdrawalsAction();
          setUserHistory(
            history.filter((w) => w.userId === selectedWithdrawal.userId)
          );
        } catch {}
      }
    };
    fetchHistory();
  }, [selectedWithdrawal]);

  const loadWithdrawals = async () => {
    try {
      const data = await getAllWithdrawalsAction();
      setWithdrawals(data);
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
      toast.error("Failed to load withdrawals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (status: "approved" | "declined") => {
    if (!selectedWithdrawal) return;

    setIsUpdating(true);
    try {
      const updated = await updateWithdrawalStatusAction(
        selectedWithdrawal.id,
        status,
        adminNotes
      );

      if (updated) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === selectedWithdrawal.id ? updated : w))
        );
        toast.success(`Withdrawal ${status} successfully`);
        setSelectedWithdrawal(null);
        setAdminNotes("");
        setTransactionRef("");
      }
    } catch (error) {
      console.error("Failed to update withdrawal:", error);
      toast.error("Failed to update withdrawal status");
    } finally {
      setIsUpdating(false);
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

  const filteredWithdrawals = withdrawals.filter((withdrawal: Withdrawal) => {
    const matchesStatus =
      statusFilter === "all" || withdrawal.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || withdrawal.method === methodFilter;
    const matchesSearch = searchQuery
      ? withdrawal.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        withdrawal.amount.toString().includes(searchQuery)
      : true;
    const matchesDateRange =
      (!dateRange.start ||
        new Date(withdrawal.createdAt) >= new Date(dateRange.start)) &&
      (!dateRange.end ||
        new Date(withdrawal.createdAt) <= new Date(dateRange.end));

    return matchesStatus && matchesMethod && matchesSearch && matchesDateRange;
  });

  return (
    <Block>
      <BlockBody>
        <div className="mb-6 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Withdrawal Management
          </h1>
          {/* Export button removed */}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {withdrawalStatus.enumValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {withdrawalMethod.enumValues.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method
                      .split("_")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by user or amount"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-6 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
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
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((withdrawal: Withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {userProfiles[withdrawal.userId] ? (
                        <>
                          <div className="font-medium">
                            {userProfiles[withdrawal.userId].firstName}{" "}
                            {userProfiles[withdrawal.userId].lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {userProfiles[withdrawal.userId].email}
                          </div>
                        </>
                      ) : (
                        withdrawal.userId
                      )}
                    </TableCell>
                    <TableCell>
                      ${withdrawal.amount.toFixed(2)} {withdrawal.currency}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="capitalize">
                          {withdrawal.method
                            .split("_")
                            .map(
                              (word: string) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
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
                      <Badge variant={getStatusBadgeVariant(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(withdrawal.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Withdrawal Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Amount</Label>
                                <p className="text-lg font-semibold">
                                  ${withdrawal.amount.toFixed(2)}{" "}
                                  {withdrawal.currency}
                                </p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <Badge
                                  variant={getStatusBadgeVariant(
                                    withdrawal.status
                                  )}
                                >
                                  {withdrawal.status}
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <Label>Withdrawal Method</Label>
                              <p className="capitalize">
                                {withdrawal.method
                                  .split("_")
                                  .map(
                                    (word: string) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")}
                              </p>
                            </div>

                            {withdrawal.method === "bank_transfer" ? (
                              <>
                                <div>
                                  <Label>Bank Name</Label>
                                  <p>{withdrawal.bankName}</p>
                                </div>
                                <div>
                                  <Label>Account Number</Label>
                                  <p>{withdrawal.accountNumber}</p>
                                </div>
                                <div>
                                  <Label>Account Name</Label>
                                  <p>{withdrawal.accountName}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <Label>Cryptocurrency</Label>
                                  <p>{withdrawal.cryptoCurrency}</p>
                                </div>
                                <div>
                                  <Label>Wallet Address</Label>
                                  <p className="break-all">
                                    {withdrawal.cryptoAddress}
                                  </p>
                                </div>
                                <div>
                                  <Label>Network</Label>
                                  <p>{withdrawal.cryptoNetwork}</p>
                                </div>
                              </>
                            )}

                            {withdrawal.status === "pending" && (
                              <>
                                <div>
                                  <Label>Admin Notes</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) =>
                                      setAdminNotes(e.target.value)
                                    }
                                    placeholder="Add notes about this withdrawal..."
                                  />
                                </div>
                                <div>
                                  <Label>Transaction Reference</Label>
                                  <Input
                                    value={transactionRef}
                                    onChange={(e) =>
                                      setTransactionRef(e.target.value)
                                    }
                                    placeholder="Enter transaction reference number"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleStatusUpdate("declined")
                                    }
                                    disabled={isUpdating}
                                  >
                                    Decline
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleStatusUpdate("approved")
                                    }
                                    disabled={isUpdating}
                                  >
                                    Approve
                                  </Button>
                                </div>
                              </>
                            )}

                            {withdrawal.adminNotes && (
                              <div>
                                <Label>Admin Notes</Label>
                                <p className="text-sm text-gray-600">
                                  {withdrawal.adminNotes}
                                </p>
                              </div>
                            )}

                            <div>
                              <Label>Available Balance</Label>
                              <p className="text-lg font-semibold">
                                {userProfiles[withdrawal.userId]?.balance !==
                                undefined
                                  ? `$${userProfiles[withdrawal.userId].balance.toFixed(2)}`
                                  : "-"}
                              </p>
                            </div>

                            <div>
                              <Label>User Withdrawal History</Label>
                              <div className="rounded-md border mt-2">
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
                                    {userHistory.length > 0 ? (
                                      userHistory.map((w) => (
                                        <TableRow key={w.id}>
                                          <TableCell>
                                            ${w.amount.toFixed(2)} {w.currency}
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-col">
                                              <span className="capitalize">
                                                {w.method}
                                              </span>
                                              {w.method === "crypto" && (
                                                <span className="text-sm text-gray-500">
                                                  {w.cryptoCurrency} (
                                                  {w.cryptoNetwork})
                                                </span>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={getStatusBadgeVariant(
                                                w.status
                                              )}
                                            >
                                              {w.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {new Date(
                                              w.createdAt
                                            ).toLocaleDateString()}
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell
                                          colSpan={4}
                                          className="h-24 text-center"
                                        >
                                          No withdrawal history found.
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No withdrawals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </BlockBody>
    </Block>
  );
};

export default AdminWithdrawalsPage;
