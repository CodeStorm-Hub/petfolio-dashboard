"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createAnnouncement(
  title: string,
  body: string,
  isPinned: boolean
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("vendor_announcements")
    .insert({ title, body, is_pinned: isPinned, created_by: user?.id });

  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePath("/vendor");
  return { error: null };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vendor_announcements").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePath("/vendor");
  return { error: null };
}

export async function setAnnouncementPinned(id: string, isPinned: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vendor_announcements")
    .update({ is_pinned: isPinned })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePath("/vendor");
  return { error: null };
}
