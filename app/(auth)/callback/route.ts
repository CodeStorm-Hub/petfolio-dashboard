import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const appMetadata = data.user.app_metadata as {
        is_vendor?: boolean;
        is_admin?: boolean;
      };

      const destination =
        redirect ?? (appMetadata.is_admin ? "/admin" : "/vendor");

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
