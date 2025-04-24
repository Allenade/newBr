"use server";

import { Supabase } from "@/services/db/supabase/ssr";
import type { AuthActions } from "@/services/actions/auth/interfaces/auth.actions.dto";
import { handleError } from "@/lib/utils";
import { createProfileAction } from "@/services/actions/profile/profile.actions";
import { redirect, RedirectType } from "next/navigation";

// ~ =============================================>
// ~ ======= Sign up User with email and Password
// ~ =============================================>
export const signUpWithEmailAndPassword = async (
  profileData: AuthActions.SignUpProps
) => {
  const { email, password } = profileData;
  console.log("[Auth] Attempting to sign up user:", email);

  const client = await new Supabase().ssr_client();

  // ~ ======= Create user account ======= ~
  const { data: user, error: signUpError } = await client.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error("[Auth] Sign up error:", signUpError);
    handleError(signUpError);
  }

  // ~ ======= Create profile if account has been created ======= ~
  if (user) {
    console.log("[Auth] User account created successfully:", user.user?.id);
    try {
      const profile = await createProfileAction({
        id: user.user?.id,
        ...profileData,
        role: email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? "admin" : "user",
      });
      console.log("[Auth] Profile created successfully:", profile);
      return profile;
    } catch (error) {
      console.error("[Auth] Failed to create profile:", error);
      throw error;
    }
  }

  return null;
};

// ~ =============================================>
// ~ ======= Sign in user with Email & Password
// ~ =============================================>
export const signInUserWithEmailPassword = async (
  signInData: AuthActions.SignInProps
) => {
  const { email, password } = signInData;
  console.log("[Auth] Attempting to sign in user:", email);

  const client = await new Supabase().ssr_client();

  const { data: user, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[Auth] Sign in error:", error);
    handleError(error);
  }

  console.log("[Auth] User signed in successfully:", user?.user?.id);
  return user?.user;
};

// ~ =============================================>
// ~ ======= Get current user
// ~ =============================================>
export const getCurrentUser = async () => {
  console.log("[Auth] Getting current user");
  const client = await new Supabase().ssr_client();

  const { data: user, error } = await client.auth.getUser();

  if (error) {
    console.error("[Auth] Get current user error:", error);
    handleError(error);
  }

  console.log("[Auth] Current user:", user?.user?.id);
  return user.user;
};

// ~ =============================================>
// ~ ======= Sign out
// ~ =============================================>
export const signOutUser = async () => {
  console.log("[Auth] Signing out user");
  const client = await new Supabase().ssr_client();

  const { error } = await client.auth.signOut();

  if (error) {
    console.error("[Auth] Sign out error:", error);
    handleError(error);
  }

  console.log("[Auth] User signed out successfully");
  redirect("/auth/signin", RedirectType.replace);
};
