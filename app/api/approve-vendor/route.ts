import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAdmin = (user?.app_metadata as { is_admin?: boolean } | undefined)
    ?.is_admin;

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ownerId } = await request.json();
  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: targetUser, error: fetchError } =
    await adminClient.auth.admin.getUserById(ownerId);

  if (fetchError || !targetUser.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    ownerId,
    {
      app_metadata: {
        ...targetUser.user.app_metadata,
        is_vendor: true,
      },
    }
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
