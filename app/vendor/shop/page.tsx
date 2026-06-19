import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { ShopSetupForm } from "./shop-setup-form";
import { ShopSettingsForm } from "./shop-settings-form";

export const dynamic = "force-dynamic";

export default async function VendorShopPage() {
  const { shop } = await getCurrentVendorShop();

  if (!shop) {
    return <ShopSetupForm />;
  }

  const supabase = await createClient();
  const [tradeLicense, nationalId] = await Promise.all([
    shop.trade_license_url
      ? supabase.storage
          .from("kyc-documents")
          .createSignedUrl(shop.trade_license_url, 60 * 10)
      : Promise.resolve({ data: null }),
    shop.national_id_url
      ? supabase.storage
          .from("kyc-documents")
          .createSignedUrl(shop.national_id_url, 60 * 10)
      : Promise.resolve({ data: null }),
  ]);

  return (
    <ShopSettingsForm
      shop={shop}
      kycPreviewUrls={{
        tradeLicense: tradeLicense.data?.signedUrl ?? null,
        nationalId: nationalId.data?.signedUrl ?? null,
      }}
    />
  );
}
