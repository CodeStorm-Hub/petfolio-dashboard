import { redirect } from "next/navigation";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { PromosView } from "@/components/vendor/promos-view";

export const dynamic = "force-dynamic";

export default async function VendorPromosPage() {
  const { shop } = await getCurrentVendorShop();
  if (!shop) redirect("/vendor/shop");

  const supabase = await createClient();
  const { data: promos } = await supabase
    .from("promos")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Promos</h1>
      <PromosView shopId={shop.id} promos={promos ?? []} />
    </div>
  );
}
