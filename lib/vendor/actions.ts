"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type ShopUpdate = Database["public"]["Tables"]["shops"]["Update"];
type ShopInsert = Database["public"]["Tables"]["shops"]["Insert"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createShop(input: { shop_name: string; description?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload: ShopInsert = {
    owner_id: user.id,
    shop_name: input.shop_name,
    slug: slugify(input.shop_name),
    description: input.description ?? null,
  };

  const { error } = await supabase.from("shops").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/vendor");
  return { error: null };
}

export async function updateShop(shopId: string, updates: ShopUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shops")
    .update(updates)
    .eq("id", shopId);

  if (error) return { error: error.message };

  revalidatePath("/vendor/shop");
  revalidatePath("/vendor");
  return { error: null };
}

export async function submitKyc(
  shopId: string,
  documents: { trade_license_url: string; national_id_url: string }
) {
  return updateShop(shopId, {
    trade_license_url: documents.trade_license_url,
    national_id_url: documents.national_id_url,
    kyc_status: "submitted",
  });
}

export async function requestShopDeletion(shopId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("shop_deletion_requests").insert({
    shop_id: shopId,
    owner_id: user.id,
    reason,
  });

  if (error) return { error: error.message };
  return { error: null };
}
