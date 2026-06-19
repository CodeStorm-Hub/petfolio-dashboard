import { redirect } from "next/navigation";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { EarningsView } from "@/components/vendor/earnings-view";

export const dynamic = "force-dynamic";

export default async function VendorEarningsPage() {
  const { shop } = await getCurrentVendorShop();
  if (!shop) redirect("/vendor/shop");

  const supabase = await createClient();
  const [{ data: ledgers }, { data: payoutRequests }] = await Promise.all([
    supabase
      .from("vendor_ledgers")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payout_requests")
      .select("*")
      .eq("shop_id", shop.id)
      .order("requested_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Earnings</h1>
      <EarningsView
        shopId={shop.id}
        ledgers={ledgers ?? []}
        payoutRequests={payoutRequests ?? []}
      />
    </div>
  );
}
