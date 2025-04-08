"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface PlanFeature {
  id: string;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  returnPercentage: number;
  bonusAmount: number;
  duration: string;
  features: PlanFeature[];
  created_at?: string;
  updated_at?: string;
}

export async function getPlans() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching plans:", error);
      return { error };
    }

    // Transform the data to match our frontend interface
    const transformedData = data.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      returnPercentage: Number(plan.return_percentage),
      bonusAmount: Number(plan.bonus_amount),
      duration: plan.duration,
      features: plan.features,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    }));

    return { data: transformedData };
  } catch (error) {
    console.error("Error in getPlans:", error);
    return { error };
  }
}

export async function createPlan(plan: Omit<Plan, "id">) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("plans")
      .insert([
        {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          return_percentage: plan.returnPercentage,
          bonus_amount: plan.bonusAmount,
          duration: plan.duration,
          features: plan.features,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating plan:", error);
      return { error };
    }

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    return { data: data[0] };
  } catch (error) {
    console.error("Error in createPlan:", error);
    return { error };
  }
}

export async function updatePlan(id: string, plan: Omit<Plan, "id">) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("plans")
      .update({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        return_percentage: plan.returnPercentage,
        bonus_amount: plan.bonusAmount,
        duration: plan.duration,
        features: plan.features,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating plan:", error);
      return { error };
    }

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    return { data: data[0] };
  } catch (error) {
    console.error("Error in updatePlan:", error);
    return { error };
  }
}

export async function deletePlan(id: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from("plans").delete().eq("id", id);

    if (error) {
      console.error("Error deleting plan:", error);
      return { error };
    }

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error) {
    console.error("Error in deletePlan:", error);
    return { error };
  }
}

export async function setupPlansTable() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Create the plans table
    const { error: tableError } = await supabase
      .from("plans")
      .select("*")
      .limit(1);

    if (tableError?.code === "42P01") {
      // Table doesn't exist error code
      // Create table if it doesn't exist
      const { error: createError } = await supabase.from("plans").insert({
        name: "Sample Plan",
        description: "This is a sample plan to initialize the table",
        price: 100,
        return_percentage: 15,
        bonus_amount: 50,
        duration: "7 days",
        features: [{ id: "1", name: "Sample Feature" }],
      });

      if (createError && createError.code !== "42P01") {
        console.error("Error creating plans table:", createError);
        return { error: createError };
      }

      // Enable RLS
      await supabase.auth.admin.createUser({
        email: "temp@example.com",
        password: "temporary123",
        user_metadata: { role: "admin" },
      });

      // Delete the temporary plan
      await supabase.from("plans").delete().eq("name", "Sample Plan");
    }

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error) {
    console.error("Error in setupPlansTable:", error);
    return { error };
  }
}

export async function setAdminRole() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!user) {
      throw new Error("No user found");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { role: "admin" },
    });

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Error setting admin role:", error);
    return { error };
  }
}
