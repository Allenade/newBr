"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthActions } from "@/services/actions/auth/interfaces/auth.actions.dto";
import {
  signInUserWithEmailPassword,
  signUpWithEmailAndPassword,
  getCurrentUser,
  signOutUser,
} from "@/services/actions/auth/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ~ ======= Sign up new user ======= ~
  const { mutate: signUpWithEmail, isPending: isSigningUp } = useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: async (args: AuthActions.SignUpProps) =>
      signUpWithEmailAndPassword(args),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth", "user"],
      });
      toast.success("User created successfully");
      router.push("/user/dashboard/overview");
    },

    onError: (error: Error) => {
      console.log(error.message);
      toast.error("Failed to create user");
    },
  });

  // ~ ======= Sign in user  ======= ~
  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationKey: ["auth", "signin"],
    mutationFn: async (args: AuthActions.SignInProps) =>
      await signInUserWithEmailPassword(args),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-profile"],
      });

      toast.success("Signed in successfully");
      router.replace("/user/dashboard/overview");
    },

    onError: (error: Error) => {
      console.log(error.message);
      toast.error("Failed to sign in");
    },
  });

  // ~ ======= Get current user  ======= ~
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => getCurrentUser(),
    gcTime: 5000,
    staleTime: 5000,
  });

  // ~ ======= Sign out user  ======= ~
  const signOut = async () => {
    await signOutUser();
  };

  // ~ ======= Returns ======= ~
  return {
    signUpWithEmail,
    isSigningUp,
    signIn,
    isSigningIn,
    user,
    isLoadingUser,
    signOut,
  };
};
