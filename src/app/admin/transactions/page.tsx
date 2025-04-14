"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trash2, Edit2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type PaymentMethod = {
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
};

const TransactionsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const { toast } = useToast();
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_PROJECT_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);

  // Crypto specific
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");

  // Bank specific
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  React.useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
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
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEnabled(true);
    setAddress("");
    setNetwork("");
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setEditingMethod(null);
  };

  const handleSubmit = async (type: "CRYPTO" | "BANK") => {
    try {
      if (!name) {
        throw new Error("Name is required");
      }

      const details =
        type === "CRYPTO"
          ? { address, network }
          : { bankName, accountName, accountNumber };

      const methodData = {
        name,
        description: description || null,
        type,
        enabled,
        details,
      };

      if (editingMethod) {
        const { error } = await supabase
          .from("payment_methods")
          .update(methodData)
          .eq("id", editingMethod.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("payment_methods")
          .insert([methodData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Payment method added successfully",
        });
      }

      resetForm();
      loadPaymentMethods();
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save payment method",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
      loadPaymentMethods();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete payment method",
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setName(method.name);
    setDescription(method.description || "");
    setEnabled(method.enabled);

    if (method.type === "CRYPTO") {
      setAddress(method.details.address || "");
      setNetwork(method.details.network || "");
    } else {
      setBankName(method.details.bankName || "");
      setAccountName(method.details.accountName || "");
      setAccountNumber(method.details.accountNumber || "");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Bitcoin, Bank of America"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the payment method"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>

              <Tabs defaultValue="crypto" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="crypto">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Wallet Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter wallet address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="network">Network</Label>
                      <Input
                        id="network"
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        placeholder="e.g., Bitcoin, Ethereum, USDT-TRC20"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleSubmit("CRYPTO")}
                    >
                      {editingMethod ? "Update" : "Add"} Crypto Payment Method
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="bank">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Enter bank name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Enter account name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleSubmit("BANK")}
                    >
                      {editingMethod ? "Update" : "Add"} Bank Payment Method
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {editingMethod && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetForm}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>{method.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          method.type === "CRYPTO" ? "default" : "secondary"
                        }
                      >
                        {method.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={method.enabled ? "success" : "destructive"}
                      >
                        {method.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionsPage;
