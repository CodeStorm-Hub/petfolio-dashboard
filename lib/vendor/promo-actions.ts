"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type PromoInsert = Database["public"]["Tables"]["promos"]["Insert"];
type PromoUpdate = Database["public"]["Tables"]["promos"]["Update"];

export async function createPromo(
  shopId: string,
  input: Omit<PromoInsert, "shop_id">
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("promos")
    .insert({ ...input, shop_id: shopId });

  if (error) return { error: error.message };

  revalidatePath("/vendor/promos");
  return { error: null };
}

export async function updatePromo(promoId: string, updates: PromoUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("promos")
    .update(updates)
    .eq("id", promoId);

  if (error) return { error: error.message };

  revalidatePath("/vendor/promos");
  return { error: null };
}

export async function setPromoActive(promoId: string, isActive: boolean) {
  return updatePromo(promoId, { is_active: isActive });
}
