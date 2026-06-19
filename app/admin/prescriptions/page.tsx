import { createClient } from "@/lib/supabase/server";
import { PrescriptionsView } from "@/components/admin/prescriptions-view";

export const dynamic = "force-dynamic";

export default async function AdminPrescriptionsPage() {
  const supabase = await createClient();
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const orderIds = Array.from(
    new Set((prescriptions ?? []).map((prescription) => prescription.order_id))
  );

  const [{ data: orders }, signedUrls] = await Promise.all([
    orderIds.length
      ? supabase.from("marketplace_orders").select("id, title").in("id", orderIds)
      : Promise.resolve({ data: [] }),
    Promise.all(
      (prescriptions ?? []).map(async (prescription) => {
        const { data } = await supabase.storage
          .from("prescriptions")
          .createSignedUrl(prescription.file_path, 600);
        return [prescription.id, data?.signedUrl ?? null] as const;
      })
    ),
  ]);

  const orderLabels = Object.fromEntries(
    (orders ?? []).map((order) => [order.id, order.title])
  );
  const fileUrls = Object.fromEntries(
    signedUrls.filter(([, url]) => url).map(([id, url]) => [id, url as string])
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Prescriptions</h1>
      <PrescriptionsView
        prescriptions={prescriptions ?? []}
        orderLabels={orderLabels}
        fileUrls={fileUrls}
      />
    </div>
  );
}
