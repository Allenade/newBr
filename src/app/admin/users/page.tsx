"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface Profile {
  user_id: string;
  email: string;
  plan_id: string | null;
  plan_name: string;
  balance: number;
  bonus: number;
  trading_points: number;
  earnings: number;
  updated_at: string;
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchProfiles();
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price");

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load plans. Please try again.",
      });
    }
  }

  async function fetchProfiles() {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_all_users_simple");

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      if (Array.isArray(data)) {
        setProfiles(data);
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSaving(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const planId = formData.get("plan") as string;
      const balance = formData.get("balance") as string;
      const addBalance = formData.get("add_balance") as string;
      const bonus = formData.get("bonus") as string;
      const addBonus = formData.get("add_bonus") as string;
      const tradingPoints = formData.get("trading_points") as string;
      const addTradingPoints = formData.get("add_trading_points") as string;
      const earnings = formData.get("earnings") as string;
      const addEarnings = formData.get("add_earnings") as string;

      // Update plan if changed
      if (planId !== selectedUser.plan_id) {
        const { error: planError } = await supabase.rpc("update_user_plan", {
          user_id_param: selectedUser.user_id,
          plan_id_param: planId === "no_plan" ? null : planId,
        });

        if (planError) throw planError;
      }

      // Update balance
      const newBalance = parseFloat(balance);
      if (!isNaN(newBalance)) {
        const { error: balanceError } = await supabase.rpc("set_balance", {
          user_id_param: selectedUser.user_id,
          amount: newBalance,
        });
        if (balanceError) throw balanceError;
      }

      // Add to balance if provided
      if (addBalance && parseFloat(addBalance) > 0) {
        const { error: addBalanceError } = await supabase.rpc(
          "add_to_balance",
          {
            user_id: selectedUser.user_id,
            amount: parseFloat(addBalance),
          }
        );
        if (addBalanceError) throw addBalanceError;
      }

      // Update bonus
      const newBonus = parseFloat(bonus);
      if (!isNaN(newBonus)) {
        const { error: bonusError } = await supabase.rpc("set_bonus", {
          user_id_param: selectedUser.user_id,
          amount: newBonus,
        });
        if (bonusError) throw bonusError;
      }

      // Add to bonus if provided
      if (addBonus && parseFloat(addBonus) > 0) {
        const { error: addBonusError } = await supabase.rpc("add_to_bonus", {
          user_id: selectedUser.user_id,
          amount: parseFloat(addBonus),
        });
        if (addBonusError) throw addBonusError;
      }

      // Update trading points
      const newTradingPoints = parseInt(tradingPoints);
      if (!isNaN(newTradingPoints)) {
        const { error: tradingPointsError } = await supabase.rpc(
          "set_trading_points",
          {
            user_id_param: selectedUser.user_id,
            amount: newTradingPoints,
          }
        );
        if (tradingPointsError) throw tradingPointsError;
      }

      // Add to trading points if provided
      if (addTradingPoints && parseInt(addTradingPoints) > 0) {
        const { error: addTradingPointsError } = await supabase.rpc(
          "add_to_trading_points",
          {
            user_id: selectedUser.user_id,
            amount: parseInt(addTradingPoints),
          }
        );
        if (addTradingPointsError) throw addTradingPointsError;
      }

      // Update earnings
      const newEarnings = parseFloat(earnings);
      if (!isNaN(newEarnings)) {
        const { error: earningsError } = await supabase.rpc("set_earnings", {
          user_id_param: selectedUser.user_id,
          amount: newEarnings,
        });
        if (earningsError) throw earningsError;
      }

      // Add to earnings if provided
      if (addEarnings && parseFloat(addEarnings) > 0) {
        const { error: addEarningsError } = await supabase.rpc(
          "add_to_earnings",
          {
            user_id: selectedUser.user_id,
            amount: parseFloat(addEarnings),
          }
        );
        if (addEarningsError) throw addEarningsError;
      }

      // Refresh the data
      await fetchProfiles();

      toast({
        title: "Success",
        description: "User updated successfully.",
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update user. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Trading Points</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((profile) => (
                <TableRow key={profile.user_id}>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.plan_name}</TableCell>
                  <TableCell>${profile.balance.toFixed(2)}</TableCell>
                  <TableCell>${profile.bonus.toFixed(2)}</TableCell>
                  <TableCell>{profile.trading_points || 0}</TableCell>
                  <TableCell>${(profile.earnings || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(profile);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // Navigate to user's account page
                            window.location.href = `/admin/users/${profile.user_id}`;
                          }}
                        >
                          Access Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Update the user&apos;s plan, balance, or bonus amount.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveChanges}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={selectedUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  name="plan"
                  defaultValue={selectedUser?.plan_id || "no_plan"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_plan">No Plan</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedUser?.balance.toFixed(2) || "0.00"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add_balance">Add to Balance</Label>
                <Input
                  id="add_balance"
                  name="add_balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount to add"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bonus">Bonus</Label>
                <Input
                  id="bonus"
                  name="bonus"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedUser?.bonus.toFixed(2) || "0.00"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add_bonus">Add to Bonus</Label>
                <Input
                  id="add_bonus"
                  name="add_bonus"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount to add"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trading_points">Trading Points</Label>
                <Input
                  id="trading_points"
                  name="trading_points"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={selectedUser?.trading_points || 0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add_trading_points">
                  Add to Trading Points
                </Label>
                <Input
                  id="add_trading_points"
                  name="add_trading_points"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Enter points to add"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="earnings">Earnings</Label>
                <Input
                  id="earnings"
                  name="earnings"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedUser?.earnings?.toFixed(2) || "0.00"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add_earnings">Add to Earnings</Label>
                <Input
                  id="add_earnings"
                  name="add_earnings"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount to add"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
