import { createClient } from "@/lib/supabase/server";
import { AnnouncementsView } from "@/components/admin/announcements-view";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("vendor_announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Announcements</h1>
      <AnnouncementsView announcements={announcements ?? []} />
    </div>
  );
}
