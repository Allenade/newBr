"use server";

import { profiles } from "@/schemas/profiles.schema";
import { getSingle } from "@/lib/utils";
import db from "@/services/db";
import { eq } from "drizzle-orm";
import { Supabase } from "@/services/db/supabase/ssr";
import { userTransactionTotals } from "@/services/db/schema/user-transaction-totals.schema";
import { transaction } from "@/services/db/schema/transactions.schema";
import { createClient } from "@supabase/supabase-js";

// ~ =============================================>
// ~ ======= Create a new profile
// ~ =============================================>
export const createProfileAction = async (
  profileData: typeof profiles.$inferInsert
) => {
  return await getSingle(db.insert(profiles).values(profileData).returning());
};

// ~ =============================================>
// ~ ======= Get Profile by ID
// ~ =============================================>
export const getProfileAction = async (id: string) => {
  return await getSingle(db.select().from(profiles).where(eq(profiles.id, id)));
};

// ~ =============================================>
// ~ ======= Get all profiles  -->
// ~ =============================================>
export const getALlProfilesAction = async () => {
  return db.select().from(profiles);
};

// ~ =============================================>
// ~ ======= Update a profile
// ~ =============================================>
export const updateProfileAction = async (
  id: string,
  updateData: Partial<typeof profiles.$inferSelect>
) => {
  return await getSingle(
    db.update(profiles).set(updateData).where(eq(profiles.id, id)).returning()
  );
};

// ~ =============================================>
// ~ ======= Delete a profile
// ~ =============================================>
export const deleteProfileAction = async (id: string) => {
  try {
    // First check if the profile exists
    const existingProfile = await getProfileAction(id);
    if (!existingProfile) {
      throw new Error("Profile not found");
    }

    // Check if the user is trying to delete themselves
    const client = await new Supabase().ssr_client();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user?.id === id) {
      throw new Error("You cannot delete your own profile");
    }

    // Delete all related records
    await db
      .delete(userTransactionTotals)
      .where(eq(userTransactionTotals.user_id, id));
    await db.delete(transaction).where(eq(transaction.profileId, id));

    // Delete the profile
    const result = await db
      .delete(profiles)
      .where(eq(profiles.id, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Failed to delete profile");
    }

    // Delete the auth account using service role
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

    const { error: deleteAuthError } =
      await serviceClient.auth.admin.deleteUser(id);
    if (deleteAuthError) {
      throw new Error("Failed to delete auth account");
    }

    return result[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while deleting the profile");
  }
};
