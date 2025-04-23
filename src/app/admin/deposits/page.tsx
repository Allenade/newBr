"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MoreHorizontal, ArrowUpDown, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTotalDeposits } from "@/lib/hooks/deposits/use-total-deposits";
import { useUser } from "@/lib/hooks/user/use-user";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { updateTotalDepositsAction } from "@/services/actions/total-deposits/total-deposits.actions";
import { updateTransactionStatusAction } from "@/services/actions/transactions/transactions.actions";
import { totalDeposits } from "@/services/db/schema/total-deposits.schema";
import { transactionStatusEnum } from "@/services/db/schema/transactions.schema";

const AdminDepositsPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    totalDeposits: deposits,
    isLoading: depositsLoading,
    error: depositsError,
  } = useTotalDeposits();
  const { profiles, profilesIsLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"amount" | "date" | "user">(
    "date"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Get totals from profiles (same as admin overview)
  const totalUsers = profiles?.length || 0;
  const totalAmount =
    profiles?.reduce((sum, profile) => sum + profile.balance, 0) || 0;
  const averageDeposit = totalUsers > 0 ? totalAmount / totalUsers : 0;

  // Get user names for the table
  const getUserName = (userId: string | null) => {
    if (!userId) return "N/A";
    const profile = profiles?.find((p) => p.id === userId);
    return profile
      ? `${profile.firstName} ${profile.lastName}`
      : "Unknown User";
  };

  // Filter and sort deposits
  const filteredAndSortedDeposits = deposits
    ?.filter((deposit) => {
      if (!searchTerm) return true;
      const userName = getUserName(deposit.userId).toLowerCase();
      return (
        userName.includes(searchTerm.toLowerCase()) ||
        deposit.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    ?.sort((a, b) => {
      switch (sortField) {
        case "amount":
          return sortDirection === "asc"
            ? Number(a.totalAmount) - Number(b.totalAmount)
            : Number(b.totalAmount) - Number(a.totalAmount);
        case "date":
          return sortDirection === "asc"
            ? new Date(a.lastDepositDate || "").getTime() -
                new Date(b.lastDepositDate || "").getTime()
            : new Date(b.lastDepositDate || "").getTime() -
                new Date(a.lastDepositDate || "").getTime();
        case "user":
          return sortDirection === "asc"
            ? getUserName(a.userId).localeCompare(getUserName(b.userId))
            : getUserName(b.userId).localeCompare(getUserName(a.userId));
        default:
          return 0;
      }
    });

  const handleStatusUpdate = async (
    deposit: typeof totalDeposits.$inferSelect,
    status: (typeof transactionStatusEnum.enumValues)[number]
  ) => {
    try {
      // Update transaction status
      await updateTransactionStatusAction(deposit.id, status);

      // If approved, update total deposits
      if (status === "approved") {
        await updateTotalDepositsAction(deposit.userId!);
      }

      toast({
        title: "Success",
        description: `Deposit ${status} successfully.`,
      });

      // Refresh the data
      router.refresh();
    } catch (err) {
      console.error("Failed to update deposit status:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update deposit status. Please try again.",
      });
    }
  };

  if (depositsLoading || profilesIsLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (depositsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load deposits data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Total Deposits</h1>
          <p className="text-muted-foreground">
            Manage and view all deposit transactions
          </p>
        </div>
        <Button onClick={() => router.back()}>Back to Overview</Button>
      </div>

      {/* Filters Section */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user name or ID"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={sortField}
          onValueChange={(value: "amount" | "date" | "user") =>
            setSortField(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() =>
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
          }
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sortDirection === "asc" ? "Ascending" : "Descending"}
        </Button>
        <Button variant="outline">Export CSV</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageDeposit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {profiles
                ?.reduce((sum, profile) => sum + profile.earnings, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposits Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Trading Points</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Last Deposit</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedDeposits?.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell className="font-medium">
                  {getUserName(deposit.userId)}
                </TableCell>
                <TableCell>{deposit.userId || "N/A"}</TableCell>
                <TableCell>${Number(deposit.balance).toFixed(2)}</TableCell>
                <TableCell>${Number(deposit.bonus).toFixed(2)}</TableCell>
                <TableCell>${Number(deposit.earnings).toFixed(2)}</TableCell>
                <TableCell>
                  ${Number(deposit.tradingPoints).toFixed(2)}
                </TableCell>
                <TableCell>${Number(deposit.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  {deposit.lastDepositDate
                    ? new Date(deposit.lastDepositDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {deposit.createdAt
                    ? new Date(deposit.createdAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {deposit.updatedAt
                    ? new Date(deposit.updatedAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(deposit, "approved")}
                      >
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(deposit, "declined")}
                      >
                        Decline
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDepositsPage;
