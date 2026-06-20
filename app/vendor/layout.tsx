import { redirect } from "next/navigation";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";

export const dynamic = "force-dynamic";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, shop } = await getCurrentVendorShop();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <VendorSidebar shopName={shop?.shop_name ?? "New shop"} shopId={shop?.id} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
