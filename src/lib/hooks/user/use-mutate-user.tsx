"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profiles } from "@/services/db/schema/profiles.schema";
import {
  updateProfileAction,
  deleteProfileAction,
} from "@/services/actions/profile/profile.actions";
import { toast } from "sonner";

export const useMutateUser = () => {
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

  // ~ ======= Delete a user  -->
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => await deleteProfileAction(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("User deleted successfully");
    },

    onError: (error: Error) => {
      console.error("[Mutation] Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    },
  });

  return { updateUser, deleteUser, isUpdating, isDeleting };
};
