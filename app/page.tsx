import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const appMetadata = user.app_metadata as {
    is_vendor?: boolean;
    is_admin?: boolean;
  };

  redirect(appMetadata.is_admin ? "/admin" : "/vendor");
}
