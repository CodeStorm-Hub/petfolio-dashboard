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

  await Promise.all(
    ownerIds.map(async (ownerId) => {
      const { data } = await adminClient.auth.admin.getUserById(ownerId);
      if (data.user?.email) ownerEmails[ownerId] = data.user.email;
    })
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vendors</h1>
      <VendorsView shops={shops ?? []} ownerEmails={ownerEmails} />
    </div>
  );
}
