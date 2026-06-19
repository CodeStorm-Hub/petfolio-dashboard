import { notFound, redirect } from "next/navigation";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { OrderDetail } from "@/components/vendor/order-detail";

export const dynamic = "force-dynamic";

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { shop } = await getCurrentVendorShop();
  if (!shop) redirect("/vendor/shop");

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("marketplace_orders")
    .select("*")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (!order) notFound();

  const [{ data: shipment }, { data: prescriptions }] = await Promise.all([
    supabase
      .from("shipments")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle(),
    supabase.from("prescriptions").select("*").eq("order_id", order.id),
  ]);

  return (
    <OrderDetail
      order={order}
      shipment={shipment ?? null}
      prescriptions={prescriptions ?? []}
    />
  );
}
