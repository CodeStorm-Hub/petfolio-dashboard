import { redirect } from "next/navigation";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { ProductsTable } from "@/components/vendor/products-table";

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
  const { shop } = await getCurrentVendorShop();
  if (!shop) redirect("/vendor/shop");

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>
      <ProductsTable shopId={shop.id} products={products ?? []} />
    </div>
  );
}
