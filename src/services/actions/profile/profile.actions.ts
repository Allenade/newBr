"use server";

import { profiles } from "@/schemas/profiles.schema";
import { getSingle } from "@/lib/utils";
import db from "@/services/db";
import { eq } from "drizzle-orm";

// ~ =============================================>
// ~ ======= Create a new profile
// ~ =============================================>
export const createProfileAction = async (
  profileData: typeof profiles.$inferInsert,
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
  updateData: Partial<typeof profiles.$inferSelect>,
) => {
  return await getSingle(
    db.update(profiles).set(updateData).where(eq(profiles.id, id)).returning(),
  );
};
