"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/use-auth";
import { profiles } from "@/services/db/schema/profiles.schema";
import { updateProfileAction } from "@/services/actions/profile/profile.actions";
import { toast } from "sonner";

export const useMutateUser = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// ~ ======= Update a user  -->
	const { mutate: updateUser, isPending: isUpdating } = useMutation({
		mutationFn: async (args: {
			id: string;
			data: Partial<typeof profiles.$inferSelect>;
		}) => await updateProfileAction(args.id, args.data),

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profiles"] });
			toast.success("User updated successfully");
		},

		onError: () => {
			toast.error("Failed to update user");
		},
	});

	return { updateUser, isUpdating };
};
