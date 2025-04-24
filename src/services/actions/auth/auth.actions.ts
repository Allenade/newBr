"use server";

import { Supabase } from "@/services/db/supabase/ssr";
import type { AuthActions } from "@/services/actions/auth/interfaces/auth.actions.dto";
import { handleError } from "@/lib/utils";
import { createProfileAction } from "@/services/actions/profile/profile.actions";
import { redirect, RedirectType } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ~ =============================================>
// ~ ======= Sign up User with email and Password
// ~ =============================================>
export const signUpWithEmailAndPassword = async (
  profileData: AuthActions.SignUpProps
) => {
  const { email, password } = profileData;
  const client = await new Supabase().ssr_client();

  try {
    // Create service role client for admin operations
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Try to sign up first
    const { data: user, error: signUpError } = await client.auth.signUp({
      email,
      password,
    });

    // If we get a user already exists error, try to delete the existing user
    if (signUpError?.message?.includes("User already registered")) {
      // Get the user by email using the service role client
      const { data: existingUser } = await serviceClient.auth.admin.listUsers();
      const userToDelete = existingUser.users.find((u) => u.email === email);

      if (userToDelete) {
        // Delete the existing user
        await serviceClient.auth.admin.deleteUser(userToDelete.id);

        // Try to sign up again
        const { data: newUser, error: newSignUpError } =
          await client.auth.signUp({
            email,
            password,
          });

        handleError(newSignUpError);

        if (newUser) {
          return await createProfileAction({
            id: newUser.user?.id,
            ...profileData,
          });
        }
      }
    } else {
      handleError(signUpError);

      if (user) {
        return await createProfileAction({
          id: user.user?.id,
          ...profileData,
        });
      }
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to sign up: ${error.message}`);
    }
    throw new Error("An unexpected error occurred during sign up");
  }
};

// ~ =============================================>
// ~ ======= Sign in user with Email & Password
// ~ =============================================>
export const signInUserWithEmailPassword = async (
  signInData: AuthActions.SignInProps
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
