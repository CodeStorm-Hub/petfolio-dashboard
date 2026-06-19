"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type OrderUpdate = Database["public"]["Tables"]["marketplace_orders"]["Update"];

export async function updateOrderStatusAdmin(orderId: string, status: string) {
  const supabase = await createClient();
  const updates: OrderUpdate = { status };

  if (status === "cancelled") {
    updates.cancelled_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("marketplace_orders")
    .update(updates)
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null };
}
