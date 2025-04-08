"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  setupPlansTable,
} from "./actions";

interface PlanFeature {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  returnPercentage: number;
  bonusAmount: number;
  duration: string;
  features: PlanFeature[];
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      const { data, error } = await getPlans();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load plans. Please try again.",
        });
        return;
      }

      setPlans(data || []);
    } catch (error) {
      console.error("Error in fetchPlans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadPlans = async () => {
      try {
        const { data, error } = await getPlans();

        if (!mounted) return;

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load plans. Please try again.",
          });
          return;
        }

        setPlans(data || []);
      } catch (error) {
        if (!mounted) return;
        console.error("Error fetching plans:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleSetupDatabase = async () => {
    try {
      setIsSettingUp(true);
      const { error } = await setupPlansTable();

      if (error) {
        toast({
          variant: "destructive",
          title: "Setup Failed",
          description: "Failed to set up the plans table. Please try again.",
        });
        return;
      }

      toast({
        title: "Setup Complete",
        description: "Plans table has been created successfully.",
      });

      // Refresh the plans list
      fetchPlans();
    } catch (error) {
      console.error("Error setting up database:", error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const planData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      returnPercentage: Number(formData.get("returnPercentage")),
      bonusAmount: Number(formData.get("bonusAmount")),
      duration: formData.get("duration") as string,
      features: [
        formData.get("trading-signals") && {
          id: "trading-signals",
          name: "Trading signals",
        },
        formData.get("support") && {
          id: "priority-support",
          name: "Priority support",
        },
        formData.get("indicators") && {
          id: "advanced-indicators",
          name: "Advanced indicators",
        },
        formData.get("updates") && {
          id: "real-time-updates",
          name: "Real-time updates",
        },
        formData.get("strategies") && {
          id: "custom-strategies",
          name: "Custom strategies",
        },
      ].filter(Boolean) as PlanFeature[],
    };

    // Add the return and bonus features automatically
    planData.features.push(
      {
        id: "return-percentage",
        name: `${planData.returnPercentage}% Expected Returns`,
      },
      {
        id: "welcome-bonus",
        name: `$${planData.bonusAmount} Welcome Bonus`,
      }
    );

    try {
      if (selectedPlan) {
        // Update existing plan
        const { error } = await updatePlan(selectedPlan.id, planData);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Plan updated successfully.",
        });
      } else {
        // Create new plan
        const { error } = await createPlan(planData);
        if (error) throw error;
        toast({
          title: "Success",
          description: "New plan created successfully.",
        });
      }

      // Refresh plans list
      fetchPlans();
      setIsCreateDialogOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save plan. Please try again.",
      });
    }
  };

  const handleDelete = async (plan: Plan) => {
    try {
      const { error } = await deletePlan(plan.id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan deleted successfully.",
      });

      // Refresh plans list
      fetchPlans();
      setPlanToDelete(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete plan. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Trading Plans</h1>
        <div className="flex gap-4">
          {plans.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSetupDatabase}
              disabled={isSettingUp}
            >
              {isSettingUp ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Setting Up...
                </>
              ) : (
                "Setup Plans Table"
              )}
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="relative rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedPlan(plan)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setPlanToDelete(plan)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="p-6">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-4">
                <div className="text-3xl font-bold">${plan.price}</div>
                <p className="text-sm text-muted-foreground">
                  Duration: {plan.duration}
                </p>
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-lg font-semibold text-green-500">
                  {plan.returnPercentage}% Expected Returns
                </div>
                <div className="text-lg font-semibold text-blue-500">
                  ${plan.bonusAmount} Welcome Bonus
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature.id} className="flex items-center">
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-sm">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isCreateDialogOpen || selectedPlan !== null}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setSelectedPlan(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={selectedPlan?.name}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue={selectedPlan?.description}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={selectedPlan?.price}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="returnPercentage" className="text-right">
                Return (%)
              </Label>
              <Input
                id="returnPercentage"
                name="returnPercentage"
                type="number"
                defaultValue={selectedPlan?.returnPercentage}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bonusAmount" className="text-right">
                Bonus ($)
              </Label>
              <Input
                id="bonusAmount"
                name="bonusAmount"
                type="number"
                defaultValue={selectedPlan?.bonusAmount}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input
                id="duration"
                name="duration"
                defaultValue={selectedPlan?.duration}
                placeholder="e.g. 7 days"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Features</Label>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trading-signals"
                    name="trading-signals"
                    defaultChecked={selectedPlan?.features.some((f) =>
                      f.name.includes("trading signals")
                    )}
                  />
                  <label
                    htmlFor="trading-signals"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Trading signals
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="support"
                    name="support"
                    defaultChecked={selectedPlan?.features.some((f) =>
                      f.name.includes("support")
                    )}
                  />
                  <label
                    htmlFor="support"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Priority support
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indicators"
                    name="indicators"
                    defaultChecked={selectedPlan?.features.some((f) =>
                      f.name.includes("indicators")
                    )}
                  />
                  <label
                    htmlFor="indicators"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Advanced indicators
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="updates"
                    name="updates"
                    defaultChecked={selectedPlan?.features.some((f) =>
                      f.name.includes("updates")
                    )}
                  />
                  <label
                    htmlFor="updates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Real-time updates
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="strategies"
                    name="strategies"
                    defaultChecked={selectedPlan?.features.some((f) =>
                      f.name.includes("strategies")
                    )}
                  />
                  <label
                    htmlFor="strategies"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Custom strategies
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {selectedPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!planToDelete}
        onOpenChange={() => setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {planToDelete?.name} plan. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => planToDelete && handleDelete(planToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
