"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export async function createProduct(
  shopId: string,
  input: Omit<ProductInsert, "shop_id">
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .insert({ ...input, shop_id: shopId });

  if (error) return { error: error.message };

  revalidatePath("/vendor/products");
  return { error: null };
}

export async function updateProduct(productId: string, updates: ProductUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/vendor/products");
  return { error: null };
}

export async function setProductsActive(productIds: string[], active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ active })
    .in("id", productIds);

  if (error) return { error: error.message };

  revalidatePath("/vendor/products");
  return { error: null };
}

export async function deleteProducts(productIds: string[]) {
  return setProductsActive(productIds, false);
}
