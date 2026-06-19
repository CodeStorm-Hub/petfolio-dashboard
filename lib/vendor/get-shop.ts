import { createClient } from "@/lib/supabase/server";

export async function getCurrentVendorShop() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, shop: null };

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return { user, shop };
}
