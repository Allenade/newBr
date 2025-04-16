"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllSubscriptionPlansAction,
  getSubscriptionPlanAction,
} from "@/services/actions/subscription-plans/subscription-plan.actions";

export const useSubscriptionPlan = (id?: string) => {
  // ~ ======= Get all subscription plans  -->
  const {
    data: subscriptionPlans,
    isLoading: subscriptionPlansIsLoading,
    error: subscriptionPlansError,
    refetch: reloadSubscriptionPlans,
  } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => getAllSubscriptionPlansAction(),
  });

  // ~ ======= Get a subscription plan  -->
  const {
    data: subscriptionPlan,
    isLoading: subscriptionPlanIsLoading,
    error: subscriptionPlanError,
    refetch: reloadSubscriptionPlan,
  } = useQuery({
    queryKey: ["subscription-plan", id],
    queryFn: () => getSubscriptionPlanAction(id! as string),
    enabled: !!id,
  });

  return {
    subscriptionPlans,
    subscriptionPlansIsLoading,
    subscriptionPlansError,
    subscriptionPlan,
    subscriptionPlanIsLoading,
    subscriptionPlanError,
    reloadSubscriptionPlans,
    reloadSubscriptionPlan,
  };
};
