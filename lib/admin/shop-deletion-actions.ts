"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function resolveShopDeletion(
  requestId: string,
  approve: boolean,
  rejectionNote?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("resolve_shop_deletion", {
    p_request_id: requestId,
    p_action: approve ? "approved" : "rejected",
    ...(approve ? {} : { p_rejection_note: rejectionNote }),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/shop-deletions");
  return { error: null };
}
