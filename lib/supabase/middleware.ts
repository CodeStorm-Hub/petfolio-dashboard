import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isVendorRoute = pathname.startsWith("/vendor");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isRoot = pathname === "/";

  if (!user && (isVendorRoute || isAdminRoute || isRoot)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (!isRoot) url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const appMetadata = user.app_metadata as {
      is_vendor?: boolean;
      is_admin?: boolean;
    };

    if (isAdminRoute && !appMetadata.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    if (isAuthRoute || isRoot) {
      const url = request.nextUrl.clone();
      url.pathname = appMetadata.is_admin ? "/admin" : "/vendor";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
