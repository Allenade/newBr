"use client";

import { SubscriptionPlanActions } from "@/services/actions/subscription-plans/interfaces/subscription-plan.actions.dto";
import {
	createSubscriptionPlanAction,
	deleteSubscriptionPlanAction,
	updateSubscriptionPlanAction,
} from "@/services/actions/subscription-plans/subscription-plan.actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMutateSubscriptionPlan = () => {
	const queryClient = useQueryClient();

	// ~ ======= Create a subscription plan  -->
	const { mutate: createSubscriptionPlan, isPending: isCreating } = useMutation(
		{
			mutationFn: (args: SubscriptionPlanActions.CreatePlanProps) =>
				createSubscriptionPlanAction(args),

			onSuccess: () => {
				toast.success("Subscription plan created successfully");
				queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
			},

			onError: () => {
				toast.error("Failed to create subscription plan");
			},
		}
	);

	// ~ ======= Update a subscription plan  -->
	const { mutate: updateSubscriptionPlan, isPending: isUpdating } = useMutation(
		{
			mutationFn: (args: SubscriptionPlanActions.UpdatePlanProps) =>
				updateSubscriptionPlanAction(args.id, args.data),

			onSuccess: (data) => {
				toast.success("Subscription plan updated successfully");
				queryClient.invalidateQueries({
					queryKey: ["subscription-plans", data?.id],
				});
				queryClient.invalidateQueries({
					queryKey: ["subscription-plans"],
				});
			},

			onError: () => {
				toast.error("Failed to update subscription plan");
			},
		}
	);

	// ~ ======= Delete a subscription plan  -->
	const { mutate: deleteSubscriptionPlan, isPending: isDeleting } = useMutation(
		{
			mutationFn: (id: string) => deleteSubscriptionPlanAction(id),

			onSuccess: () => {
				toast.success("Subscription plan deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
			},

			onError: () => {
				toast.error("Failed to delete subscription plan");
			},
		}
	);

	return {
		createSubscriptionPlan,
		updateSubscriptionPlan,
		deleteSubscriptionPlan,
		isCreating,
		isUpdating,
		isDeleting,
	};
};
