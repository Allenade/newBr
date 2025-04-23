"use client";

import Block, { BlockBody } from "@/components/templates/block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Download } from "lucide-react";
import { useUser } from "@/lib/hooks/user/use-user";
import { tradesHistory } from "@/services/db/schema/trades-history.schema";
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";
import { toast } from "sonner";

type Trade = typeof tradesHistory.$inferSelect;

export default function AdminTradesPage() {
  const { userAbility } = useUser();
  // Placeholder for actual data fetching hook
  const trades: Trade[] = [];
  const isLoading = false;

  const handleStatusChange = async () => {
    if (
      userAbility?.cannot(
        UserPermissions.Actions.manage,
        UserPermissions.Entities.admin_dashboard
      )
    ) {
      return toast.error("Not Authorized", {
        description: "You are not authorized to update trade status",
      });
    }

    // TODO: Implement status update logic
    toast.success("Trade status updated successfully");
  };

  const handleExport = () => {
    // TODO: Implement export logic
    toast.success("Exporting trades...");
  };

  return (
    <Block>
      <BlockBody>
        {/* Header section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trade History</h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor all trading activities
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Filter by Status</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Filter by Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Search</Label>
            <Input placeholder="Search by user or trade ID..." />
          </div>
        </div>

        {/* Table section */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trade ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <p className="text-muted-foreground">No trades found</p>
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-mono">
                      {trade.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{trade.userName}</TableCell>
                    <TableCell>{trade.planName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trade.tradeType === "buy"
                            ? "default"
                            : trade.tradeType === "sell"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {trade.tradeType}
                      </Badge>
                    </TableCell>
                    <TableCell>${trade.amount.toLocaleString()}</TableCell>
                    <TableCell>${trade.price.toLocaleString()}</TableCell>
                    <TableCell>${trade.totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trade.status === "completed"
                            ? "success"
                            : trade.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {trade.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {trade.createdAt
                        ? new Date(trade.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Trade</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                onValueChange={handleStatusChange}
                                defaultValue={trade.status || "pending"}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Admin Notes</Label>
                              <Input
                                placeholder="Add notes about this trade..."
                                defaultValue={trade.adminNotes || ""}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </BlockBody>
    </Block>
  );
}
