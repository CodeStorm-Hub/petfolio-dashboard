import { createClient } from "@/lib/supabase/server";
import { AdminPromosView } from "@/components/admin/admin-promos-view";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const supabase = await createClient();
  const { data: promos } = await supabase
    .from("promos")
    .select("*")
    .is("shop_id", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Platform promos</h1>
      <AdminPromosView promos={promos ?? []} />
    </div>
  );
}
