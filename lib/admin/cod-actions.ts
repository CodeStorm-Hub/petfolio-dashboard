"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function markCashReceived(orderId: string) {
  const supabase = await createClient();

  const { error: orderError } = await supabase
    .from("marketplace_orders")
    .update({ payment_status: "collected" })
    .eq("id", orderId);

  if (orderError) return { error: orderError.message };

  const { error: ledgerError } = await supabase
    .from("vendor_ledgers")
    .update({ status: "available" })
    .eq("order_id", orderId)
    .eq("status", "pending_clearance");

  if (ledgerError) return { error: ledgerError.message };

  revalidatePath("/admin/cod");
  return { error: null };
}
