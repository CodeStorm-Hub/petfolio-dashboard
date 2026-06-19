import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/admin/settings-view";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Platform settings</h1>
      <SettingsView settings={settings ?? []} />
    </div>
  );
}
