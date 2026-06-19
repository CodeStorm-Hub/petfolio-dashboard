import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("marketplace_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const [{ data: shop }, { data: shipment }] = await Promise.all([
    supabase.from("shops").select("shop_name").eq("id", order.shop_id).maybeSingle(),
    supabase.from("shipments").select("*").eq("order_id", order.id).maybeSingle(),
  ]);

  return (
    <AdminOrderDetail
      order={order}
      shopName={shop?.shop_name ?? "Unknown"}
      shipment={shipment ?? null}
    />
  );
}
