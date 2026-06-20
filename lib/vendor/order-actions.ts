"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type OrderUpdate = Database["public"]["Tables"]["marketplace_orders"]["Update"];

export async function updateOrderStatus(orderId: string, status: string) {
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

  revalidatePath("/vendor/orders");
  revalidatePath(`/vendor/orders/${orderId}`);
  return { error: null };
}

export async function cancelOrder(orderId: string, reason: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketplace_orders")
    .update({
      status: "cancelled",
      cancelled_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/vendor/orders");
  revalidatePath(`/vendor/orders/${orderId}`);
  return { error: null };
}

export async function addShipment(
  orderId: string,
  input: {
    courier: string;
    tracking_id: string;
    tracking_url?: string;
    estimated_delivery_at?: string;
    delivery_notes?: string;
  }
) {
  const supabase = await createClient();

  const { error: shipmentError } = await supabase.from("shipments").insert({
    order_id: orderId,
    courier: input.courier,
    tracking_id: input.tracking_id,
    tracking_url: input.tracking_url || null,
    estimated_delivery_at: input.estimated_delivery_at || null,
    delivery_notes: input.delivery_notes || null,
    status: "shipped",
    shipped_at: new Date().toISOString(),
  });

  if (shipmentError) return { error: shipmentError.message };

  const { error: orderError } = await supabase
    .from("marketplace_orders")
    .update({
      status: "shipped",
      shipping_carrier: input.courier,
      shipping_tracking_number: input.tracking_id,
      shipping_tracking_url: input.tracking_url || null,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (orderError) return { error: orderError.message };

  revalidatePath("/vendor/orders");
  revalidatePath(`/vendor/orders/${orderId}`);
  return { error: null };
}

export async function markDelivered(orderId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketplace_orders")
    .update({ status: "delivered" })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await supabase
    .from("shipments")
    .update({ status: "delivered" })
    .eq("order_id", orderId);

  revalidatePath("/vendor/orders");
  revalidatePath(`/vendor/orders/${orderId}`);
  return { error: null };
}

export async function reviewPrescription(
  prescriptionId: string,
  decision: "approved" | "rejected",
  note?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("prescriptions")
    .update({
      status: decision,
      review_note: note || null,
      reviewer_id: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", prescriptionId);

  if (error) return { error: error.message };

  revalidatePath("/vendor/orders");
  return { error: null };
}
