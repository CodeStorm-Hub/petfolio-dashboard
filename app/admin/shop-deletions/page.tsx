import { createClient } from "@/lib/supabase/server";
import { ShopDeletionsView } from "@/components/admin/shop-deletions-view";

export const dynamic = "force-dynamic";

export default async function AdminShopDeletionsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("shop_deletion_requests")
    .select("*")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  const shopIds = Array.from(new Set((requests ?? []).map((r) => r.shop_id)));
  const { data: shops } = shopIds.length
    ? await supabase.from("shops").select("id, shop_name").in("id", shopIds)
    : { data: [] };

  const shopNames = new Map((shops ?? []).map((s) => [s.id, s.shop_name]));

  const rows = (requests ?? []).map((r) => ({
    ...r,
    shopName: shopNames.get(r.shop_id) ?? "Unknown shop",
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Shop Deletion Requests</h1>
      <ShopDeletionsView requests={rows} />
    </div>
  );
}
