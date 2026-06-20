import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VendorsView } from "@/components/admin/vendors-view";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const supabase = await createClient();
  const { data: shops } = await supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false });

  const ownerIds = Array.from(new Set((shops ?? []).map((shop) => shop.owner_id)));
  const adminClient = createAdminClient();
  const ownerEmails: Record<string, string> = {};
  const kycFileUrls: Record<string, string> = {};

  await Promise.all([
    ...ownerIds.map(async (ownerId) => {
      const { data } = await adminClient.auth.admin.getUserById(ownerId);
      if (data.user?.email) ownerEmails[ownerId] = data.user.email;
    }),
    ...(shops ?? []).flatMap((shop) => [
      shop.trade_license_url
        ? adminClient.storage
            .from("kyc-documents")
            .createSignedUrl(shop.trade_license_url, 600)
            .then(({ data }) => {
              if (data?.signedUrl) kycFileUrls[`${shop.id}:trade_license`] = data.signedUrl;
            })
        : Promise.resolve(),
      shop.national_id_url
        ? adminClient.storage
            .from("kyc-documents")
            .createSignedUrl(shop.national_id_url, 600)
            .then(({ data }) => {
              if (data?.signedUrl) kycFileUrls[`${shop.id}:national_id`] = data.signedUrl;
            })
        : Promise.resolve(),
    ]),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vendors</h1>
      <VendorsView shops={shops ?? []} ownerEmails={ownerEmails} kycFileUrls={kycFileUrls} />
    </div>
  );
}
