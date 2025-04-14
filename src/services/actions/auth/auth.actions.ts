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
  profileData: AuthActions.SignUpProps,
) => {
  const { email, password } = profileData;
  const client = await new Supabase().ssr_client();

  // ~ ======= Create user account ======= ~
  const { data: user, error: signUpError } = await client.auth.signUp({
    email,
    password,
  });

  handleError(signUpError);

  // ~ ======= Create profile if account has been created ======= ~
  if (user) {
    return await createProfileAction({
      id: user.user?.id,
      ...profileData,
    });
  }

  return null;
};

// ~ =============================================>
// ~ ======= Sign in user with Email & Password
// ~ =============================================>
export const signInUserWithEmailPassword = async (
  signInData: AuthActions.SignInProps,
) => {
  const { email, password } = signInData;
  const client = await new Supabase().ssr_client();

  const { data: user, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  handleError(error);
  return user?.user;
};

// ~ =============================================>
// ~ ======= Get current user
// ~ =============================================>
export const getCurrentUser = async () => {
  const client = await new Supabase().ssr_client();
  const { data: user, error } = await client.auth.getUser();
  handleError(error);
  return user.user;
};

// ~ =============================================>
// ~ ======= Sign out
// ~ =============================================>
export const signOutUser = async () => {
  const client = await new Supabase().ssr_client();
  const { error } = await client.auth.signOut();
  handleError(error);
  redirect("/auth/signin", RedirectType.replace);
};
