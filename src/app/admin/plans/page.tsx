"use client";

import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlan } from "@/lib/hooks/subscription-plans/use-subscription-plan";
import { NotepadTextDashed, Plus } from "lucide-react";
import React, { useState } from "react";
import { subscriptionPlans as plansSchema } from "@/services/db/schema/subscription-plans.schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreatePlanDialog from "@/components/dialogs/create-plan-dialog";
import EditPlansSheet from "@/components/sheet/edit-plans-sheet";

type ComponentProps = Record<string, never>;

const AdminPlansPage: React.FC<ComponentProps> = ({}) => {
  const [showCreatePlanDialog, setShowCreatePlanDialog] =
    useState<boolean>(false);
  const { subscriptionPlans } = useSubscriptionPlan();
  const [showEditPlanSheet, setShowEditPlanSheet] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<
    typeof plansSchema.$inferSelect | undefined
  >(undefined);

  return (
    <Block>
      <BlockBody>
        {/* ####################################### */}
        {/* -- Top section --> */}
        {/* ####################################### */}
        <div className="mb-6 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Manage Plans</h1>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowCreatePlanDialog(true)}>
              <Plus size={18} strokeWidth={1.5} className="mr-1" /> Create Plan
            </Button>
            <CreatePlanDialog
              open={showCreatePlanDialog}
              setOpen={setShowCreatePlanDialog}
            />
          </div>
        </div>

        {/* ####################################### */}
        {/* -- Empty State --> */}
        {/* ####################################### */}
        {subscriptionPlans?.length === 0 && (
          <div className="flex items-center justify-center gap-5 flex-col h-56 border border-dashed rounded-md p-4 w-full border-muted-foreground">
            <span className="text-muted-foreground p-1 bg-muted rounded-full">
              <NotepadTextDashed size={35} />
            </span>
            <p className="text-muted-foreground">No plans found</p>
          </div>
        )}

        {/* ####################################### */}
        {/* -- Grid section for plan cards */}
        {/* ####################################### */}
        {subscriptionPlans && subscriptionPlans.length > 0 && (
          <section className="grid w-full grid-cols-3 gap-4">
            {subscriptionPlans?.map((plan) => (
              <Card
                key={plan.id}
                className="overflow-hidden border-border/40 transition-all hover:shadow-md group"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-lg font-medium mt-1">
                        ${plan.price}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowEditPlanSheet(true);
                      }}
                      className="h-8 px-3 text-xs rounded-md opacity-70 hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-muted-foreground line-clamp-3">
                    {plan.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            <EditPlansSheet
              planData={selectedPlan}
              open={showEditPlanSheet}
              setOpen={setShowEditPlanSheet}
            />
          </section>
        )}
      </BlockBody>
    </Block>
  );
};

export default AdminPlansPage;
