"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export async function upsertPlatformSetting(key: string, value: Json) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("platform_settings")
    .upsert({ key, value, updated_by: user?.id, updated_at: new Date().toISOString() });

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { error: null };
}
