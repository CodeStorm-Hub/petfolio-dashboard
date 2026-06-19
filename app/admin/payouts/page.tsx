import { createClient } from "@/lib/supabase/server";
import { PayoutsView } from "@/components/admin/payouts-view";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const supabase = await createClient();
  const { data: payoutRequests } = await supabase
    .from("payout_requests")
    .select("*")
    .order("requested_at", { ascending: false });

  const shopIds = Array.from(
    new Set((payoutRequests ?? []).map((request) => request.shop_id))
  );

  const { data: shops } = shopIds.length
    ? await supabase.from("shops").select("id, shop_name").in("id", shopIds)
    : { data: [] };

  const shopNames = Object.fromEntries(
    (shops ?? []).map((shop) => [shop.id, shop.shop_name])
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Payouts</h1>
      <PayoutsView payoutRequests={payoutRequests ?? []} shopNames={shopNames} />
    </div>
  );
}
