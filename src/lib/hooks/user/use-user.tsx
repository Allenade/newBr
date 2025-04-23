"use client";

import { useAuth } from "@/lib/hooks/auth/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  getALlProfilesAction,
  getProfileAction,
} from "@/services/actions/profile/profile.actions";
import { defineAbility } from "@/lib/permissions/abilities";
import { useEffect, useState } from "react";
import { MongoAbility } from "@casl/ability";
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";

export const useUser = () => {
  const { user } = useAuth();
  const [userAbility, setUserAbility] = useState<MongoAbility>(
    defineAbility(UserPermissions.Roles.admin)
  );

  const {
    data: profile,
    isLoading: profileIsLoading,
    refetch: reloadProfile,
  } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => getProfileAction(user!.id),
    enabled: !!user?.id,
  });

  // ~ ======= Get all profiles  -->
  const {
    data: profiles,
    isLoading: profilesIsLoading,
    refetch: reloadProfiles,
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => getALlProfilesAction(),
    gcTime: 1000 * 60 * 60, // 1 hour
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // ~ ======= Set user ability  -->
  useEffect(() => {
    if (profile)
      setUserAbility(
        defineAbility(profile.role as keyof typeof UserPermissions.Roles)
      );
  }, [profile]);

  return {
    profile,
    profileIsLoading,
    reloadProfile,
    profiles,
    profilesIsLoading,
    reloadProfiles,
    userAbility,
    setUserAbility,
  };
};
