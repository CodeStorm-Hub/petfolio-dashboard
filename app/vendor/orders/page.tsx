import { redirect } from "next/navigation";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/vendor/orders-table";

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  const { shop } = await getCurrentVendorShop();
  if (!shop) redirect("/vendor/shop");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("marketplace_orders")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <OrdersTable orders={orders ?? []} />
    </div>
  );
}
