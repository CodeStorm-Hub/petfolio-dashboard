"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function approvePayout(payoutId: string, shopId: string, amountCents: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const now = new Date().toISOString();

  const { error: payoutError } = await supabase
    .from("payout_requests")
    .update({ status: "approved", resolved_at: now, resolved_by: user?.id })
    .eq("id", payoutId);

  if (payoutError) return { error: payoutError.message };

  const { data: ledgers, error: ledgerFetchError } = await supabase
    .from("vendor_ledgers")
    .select("id, vendor_earnings_cents")
    .eq("shop_id", shopId)
    .eq("status", "available")
    .order("created_at", { ascending: true });

  if (ledgerFetchError) return { error: ledgerFetchError.message };

  let remaining = amountCents;
  const ledgerIdsToMark: string[] = [];
  for (const ledger of ledgers ?? []) {
    if (remaining <= 0) break;
    ledgerIdsToMark.push(ledger.id);
    remaining -= ledger.vendor_earnings_cents;
  }

  if (ledgerIdsToMark.length) {
    const { error: updateError } = await supabase
      .from("vendor_ledgers")
      .update({ status: "paid", paid_at: now, payout_request_id: payoutId })
      .in("id", ledgerIdsToMark);

    if (updateError) return { error: updateError.message };
  }

  revalidatePath("/admin/payouts");
  return { error: null };
}

export async function rejectPayout(payoutId: string, note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("payout_requests")
    .update({
      status: "rejected",
      notes: note,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
    })
    .eq("id", payoutId);

  if (error) return { error: error.message };

  revalidatePath("/admin/payouts");
  return { error: null };
}
