import { createClient } from "@/lib/supabase/server";
import { DisputesView } from "@/components/admin/disputes-view";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const supabase = await createClient();
  const { data: disputes } = await supabase
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Disputes</h1>
      <DisputesView disputes={disputes ?? []} />
    </div>
  );
}
