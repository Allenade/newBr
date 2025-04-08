import { createPlansTable } from "./migrations/plans";

export async function setupDatabase() {
  console.log("Setting up database...");

  // Create plans table and its policies
  const { error: plansError } = await createPlansTable();
  if (plansError) {
    console.error("Error setting up plans table:", plansError);
    return { error: plansError };
  }

  console.log("Database setup completed successfully!");
  return { success: true };
}
