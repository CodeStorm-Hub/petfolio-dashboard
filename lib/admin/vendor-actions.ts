"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveVendorKyc(shopId: string, ownerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAdmin = (user?.app_metadata as { is_admin?: boolean } | undefined)
    ?.is_admin;
  if (!user || !isAdmin) return { error: "Forbidden" };

  const { error } = await supabase
    .from("shops")
    .update({ kyc_status: "approved", is_verified: true, rejection_reason: null })
    .eq("id", shopId);

  if (error) return { error: error.message };

  const adminClient = createAdminClient();
  const { data: targetUser, error: fetchError } =
    await adminClient.auth.admin.getUserById(ownerId);

  if (fetchError || !targetUser.user) {
    return { error: fetchError?.message ?? "Vendor user not found" };
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    ownerId,
    { app_metadata: { ...targetUser.user.app_metadata, is_vendor: true } }
  );

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/vendors");
  return { error: null };
}

export async function rejectVendorKyc(shopId: string, reason: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("shops")
    .update({ kyc_status: "rejected", rejection_reason: reason })
    .eq("id", shopId);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  return { error: null };
}

export async function setShopActive(shopId: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("shops")
    .update({ is_active: isActive })
    .eq("id", shopId);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  return { error: null };
}

export async function setShopFeatured(shopId: string, featured: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("shops")
    .update({ featured })
    .eq("id", shopId);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  return { error: null };
}

export async function updatePlatformFeePercent(shopId: string, percent: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("shops")
    .update({ platform_fee_percent: percent })
    .eq("id", shopId);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  return { error: null };
}
