"use client";

import { useAuth } from "@/lib/hooks/auth/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getProfileAction } from "@/services/actions/profile/profile.actions";

export const useUser = () => {
  const { user } = useAuth();
  const {
    data: profile,
    isLoading: profileIsLoading,
    refetch: reloadProfile,
  } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => getProfileAction(user!.id),
    enabled: !!user?.id,
  });

  return { profile, profileIsLoading, reloadProfile };
};
