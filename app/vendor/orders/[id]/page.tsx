import { notFound, redirect } from "next/navigation";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const [
    { data: shipment },
    { data: prescriptions },
    { data: buyerProfile },
    { data: buyerAddresses },
  ] = await Promise.all([
    supabase.from("shipments").select("*").eq("order_id", order.id).maybeSingle(),
    supabase.from("prescriptions").select("*").eq("order_id", order.id),
    supabase
      .from("users")
      .select("id, display_name, username, avatar_url, location")
      .eq("id", order.buyer_id)
      .maybeSingle(),
    supabase
      .from("user_addresses")
      .select("label, full_address, city, zone, area, is_default")
      .eq("user_id", order.buyer_id)
      .order("is_default", { ascending: false }),
  ]);

  const prescriptionImageUrls: Record<string, string> = {};
  for (const rx of prescriptions ?? []) {
    if (rx.file_path) {
      const { data } = await supabase.storage
        .from("prescriptions")
        .createSignedUrl(rx.file_path, 3600);
      if (data?.signedUrl) prescriptionImageUrls[rx.id] = data.signedUrl;
    }
  }

  let buyerEmail: string | null = null;
  try {
    const admin = createAdminClient();
    const {
      data: { user: authUser },
    } = await admin.auth.admin.getUserById(order.buyer_id);
    buyerEmail = authUser?.email ?? null;
  } catch {
    // non-critical
  }

  const buyer = buyerProfile ? { ...buyerProfile, email: buyerEmail } : null;

  return (
    <OrderDetail
      order={order}
      shipment={shipment ?? null}
      prescriptions={prescriptions ?? []}
      prescriptionImageUrls={prescriptionImageUrls}
      shopName={shop.shop_name}
      buyer={buyer}
      buyerAddresses={buyerAddresses ?? []}
    />
  );
}
