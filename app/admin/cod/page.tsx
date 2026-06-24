import { createClient } from "@/lib/supabase/server";
import { CodView } from "@/components/admin/cod-view";

export const dynamic = "force-dynamic";

export default async function AdminCodPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("marketplace_orders")
    .select("id, shop_id, amount_cents, created_at")
    .eq("payment_method", "cod")
    .eq("status", "delivered")
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false });

  const shopIds = Array.from(new Set((orders ?? []).map((o) => o.shop_id)));
  const { data: shops } = shopIds.length
    ? await supabase.from("shops").select("id, shop_name").in("id", shopIds)
    : { data: [] };

  const shopNames = new Map((shops ?? []).map((s) => [s.id, s.shop_name]));

  const rows = (orders ?? []).map((o) => ({
    ...o,
    shopName: shopNames.get(o.shop_id) ?? "Unknown shop",
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">COD Cash Reconciliation</h1>
      <CodView orders={rows} />
    </div>
  );
}
