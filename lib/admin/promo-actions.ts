"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type PromoInsert = Database["public"]["Tables"]["promos"]["Insert"];

export async function createPlatformPromo(
  input: Omit<PromoInsert, "shop_id">
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("promos")
    .insert({ ...input, shop_id: null });

  if (error) return { error: error.message };

  revalidatePath("/admin/promos");
  return { error: null };
}

export async function setPlatformPromoActive(promoId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("promos")
    .update({ is_active: isActive })
    .eq("id", promoId);

  if (error) return { error: error.message };

  revalidatePath("/admin/promos");
  return { error: null };
}
