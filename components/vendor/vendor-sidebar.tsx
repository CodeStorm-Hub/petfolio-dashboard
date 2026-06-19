"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Wallet,
  Tag,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase/actions";
import { NotificationBell } from "@/components/vendor/notification-bell";

const NAV_ITEMS = [
  { href: "/vendor", label: "Overview", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { href: "/vendor/earnings", label: "Earnings", icon: Wallet },
  { href: "/vendor/promos", label: "Promos", icon: Tag },
  { href: "/vendor/shop", label: "Shop settings", icon: Store },
];

export function VendorSidebar({
  shopName,
  shopId,
}: {
  shopName: string;
  shopId?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex items-start justify-between border-b px-4 py-4">
        <div>
          <p className="text-sm text-muted-foreground">Vendor portal</p>
          <p className="truncate font-semibold">{shopName}</p>
        </div>
        <NotificationBell shopId={shopId} />
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/vendor"
              ? pathname === "/vendor"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
