"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function resolveDispute(disputeId: string, resolution: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("disputes")
    .update({ status: "resolved", resolution })
    .eq("id", disputeId);

  if (error) return { error: error.message };

  revalidatePath("/admin/disputes");
  return { error: null };
}
