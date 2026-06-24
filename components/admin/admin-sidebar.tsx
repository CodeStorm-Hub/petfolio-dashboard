"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  FileText,
  Wallet,
  Gavel,
  Tag,
  Settings,
  Megaphone,
  LogOut,
  Banknote,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/cod", label: "COD Reconciliation", icon: Banknote },
  { href: "/admin/prescriptions", label: "Prescriptions", icon: FileText },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/shop-deletions", label: "Shop Deletions", icon: Trash2 },
  { href: "/admin/disputes", label: "Disputes", icon: Gavel },
  { href: "/admin/promos", label: "Promos", icon: Tag },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-sidebar">
      <div className="border-b px-4 py-4">
        <p className="text-sm text-muted-foreground">Admin portal</p>
        <p className="truncate font-semibold">{email}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
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
