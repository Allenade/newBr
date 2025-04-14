"use client";

import Block, { BlockBody } from "@/components/templates/block";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlan } from "@/lib/hooks/subscription-plans/use-subscription-plan";
import { NotepadTextDashed } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function PurchasePage() {
  const { subscriptionPlans, subscriptionPlansIsLoading } =
    useSubscriptionPlan();

  if (subscriptionPlansIsLoading) {
    return (
      <Block>
        <BlockBody>
          <div className="mb-6">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        </BlockBody>
      </Block>
    );
  }

  return (
    <Block>
      <BlockBody>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Available Plans</h1>
          <p className="text-muted-foreground mt-2">
            Choose a plan that best suits your investment goals
          </p>
        </div>

        {subscriptionPlans?.length === 0 ? (
          <div className="flex items-center justify-center gap-5 flex-col h-56 border border-dashed rounded-md p-4 w-full border-muted-foreground">
            <span className="text-muted-foreground p-1 bg-muted rounded-full">
              <NotepadTextDashed size={35} />
            </span>
            <p className="text-muted-foreground">No plans available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Badge variant="secondary">{plan.duration} days</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{plan.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Features:</h4>
                    <ul className="space-y-2">
                      {plan.features?.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Return Rate:
                      </span>
                      <span className="font-medium">{plan.returnPercent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Bonus Amount:
                      </span>
                      <span className="font-medium">${plan.bonusAmount}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4">Purchase Plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </BlockBody>
    </Block>
  );
}
