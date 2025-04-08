"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  getPaymentMethods,
  createPaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
} from "./actions";

interface PaymentMethod {
  id: string;
  type: "bank" | "crypto";
  name: string;
  details: Record<string, string>;
  is_active: boolean;
}

export default function TransactionsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<"bank" | "crypto">("bank");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  async function loadPaymentMethods() {
    try {
      const data = await getPaymentMethods();
      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Error loading payment methods:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const details: Record<string, string> =
        newMethodType === "bank"
          ? {
              bankName: formData.get("bankName") as string,
              accountNumber: formData.get("accountNumber") as string,
              accountName: formData.get("accountName") as string,
            }
          : {
              network: formData.get("network") as string,
              address: formData.get("address") as string,
            };

      await createPaymentMethod({
        type: newMethodType,
        name: formData.get("name") as string,
        details,
      });

      await loadPaymentMethods();
      setIsAddingMethod(false);
      toast({
        title: "Success",
        description: "Payment method added successfully.",
      });
    } catch (err) {
      console.error("Error creating payment method:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add payment method. Please try again.",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await togglePaymentMethod(id, !currentStatus);
      await loadPaymentMethods();
      toast({
        title: "Success",
        description: "Payment method status updated successfully.",
      });
    } catch (err) {
      console.error("Error toggling payment method:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to update payment method status. Please try again.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      await deletePaymentMethod(id);
      await loadPaymentMethods();
      toast({
        title: "Success",
        description: "Payment method deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting payment method:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Payment Methods
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage deposit payment methods visible to users
          </p>
        </div>
        <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
          <DialogTrigger asChild>
            <Button>Add Payment Method</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Method Type</Label>
                <Select
                  value={newMethodType}
                  onValueChange={(value: "bank" | "crypto") =>
                    setNewMethodType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="crypto">Crypto Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  placeholder="e.g., Bank Transfer or BTC Wallet"
                  required
                />
              </div>

              {newMethodType === "bank" ? (
                <>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input name="bankName" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input name="accountNumber" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input name="accountName" required />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Input
                      name="network"
                      placeholder="e.g., Bitcoin, Ethereum"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input name="address" required />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full">
                Add Method
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Methods</TabsTrigger>
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
          <TabsTrigger value="crypto">Crypto Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{method.name}</h3>
                {method.type === "bank" ? (
                  <p className="text-sm text-gray-500">
                    {method.details.bankName} - {method.details.accountNumber}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    {method.details.network} - {method.details.address}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={method.is_active}
                    onCheckedChange={() =>
                      handleToggleStatus(method.id, method.is_active)
                    }
                  />
                  <span className="text-sm text-gray-500">
                    {method.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(method.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          {paymentMethods
            .filter((method) => method.type === "bank")
            .map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{method.name}</h3>
                  <p className="text-sm text-gray-500">
                    {method.details.bankName} - {method.details.accountNumber}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.is_active}
                      onCheckedChange={() =>
                        handleToggleStatus(method.id, method.is_active)
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {method.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          {paymentMethods
            .filter((method) => method.type === "crypto")
            .map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{method.name}</h3>
                  <p className="text-sm text-gray-500">
                    {method.details.network} - {method.details.address}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.is_active}
                      onCheckedChange={() =>
                        handleToggleStatus(method.id, method.is_active)
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {method.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
