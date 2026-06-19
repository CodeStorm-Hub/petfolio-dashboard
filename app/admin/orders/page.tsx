import { createClient } from "@/lib/supabase/server";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const [{ data: orders }, { data: shops }] = await Promise.all([
    supabase
      .from("marketplace_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("shops").select("id, shop_name"),
  ]);

  const shopNames = Object.fromEntries(
    (shops ?? []).map((shop) => [shop.id, shop.shop_name])
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <AdminOrdersTable orders={orders ?? []} shopNames={shopNames} />
    </div>
  );
}
