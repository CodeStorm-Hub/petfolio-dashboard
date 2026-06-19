"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function reviewPrescriptionAdmin(
  prescriptionId: string,
  decision: "approved" | "rejected",
  note?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("prescriptions")
    .update({
      status: decision,
      review_note: note || null,
      reviewer_id: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", prescriptionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/prescriptions");
  return { error: null };
}
