"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";

export async function getPaymentMethods() {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment methods:", error);
    throw new Error("Failed to fetch payment methods");
  }

  return data;
}

export async function createPaymentMethod(method: {
  type: "bank" | "crypto";
  name: string;
  details: Record<string, string>;
}) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase.from("payment_methods").insert([
    {
      type: method.type,
      name: method.name,
      details: method.details,
      is_active: true,
    },
  ]);

  if (error) {
    console.error("Insert error:", error);
    throw new Error(`Failed to create payment method: ${error.message}`);
  }

  revalidatePath("/admin/transactions");
  revalidatePath("/user/dashboard/deposit");
}

export async function togglePaymentMethod(id: string, isActive: boolean) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("Error toggling payment method:", error);
    throw new Error("Failed to toggle payment method");
  }

  revalidatePath("/admin/transactions");
  revalidatePath("/user/dashboard/deposit");
}

export async function deletePaymentMethod(id: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting payment method:", error);
    throw new Error("Failed to delete payment method");
  }

  revalidatePath("/admin/transactions");
  revalidatePath("/user/dashboard/deposit");
}

export async function getNewTransactionsCount() {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // Count transactions in "pending" status
  const { count, error } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    console.error("Error counting new transactions:", error);
    throw new Error("Failed to count new transactions");
  }

  return count || 0;
}

export async function updateTransactionStatus(
  id: string,
  status: "approved" | "declined"
) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating transaction:", error);
    throw new Error("Failed to update transaction status");
  }

  revalidatePath("/admin/transactions");
  revalidatePath("/user/dashboard");
}

export async function createNotification(
  userId: string,
  message: string,
  type: string
) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase.from("admin_notifications").insert([
    {
      user_id: userId,
      message,
      type,
      is_read: false,
    },
  ]);

  if (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }

  revalidatePath("/admin/dashboard");
}
