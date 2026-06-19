"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function requestPayout(input: {
  shopId: string;
  amountCents: number;
  method: "bkash" | "nagad" | "bank" | "stripe";
  accountDetails: Record<string, string>;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("payout_requests").insert({
    shop_id: input.shopId,
    amount_cents: input.amountCents,
    method: input.method,
    account_details: input.accountDetails,
  });

  if (error) return { error: error.message };

  revalidatePath("/vendor/earnings");
  return { error: null };
}
