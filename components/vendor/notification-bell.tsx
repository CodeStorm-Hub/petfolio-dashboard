"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrderRealtime } from "@/components/vendor/use-order-realtime";

export function NotificationBell({ shopId }: { shopId?: string }) {
  const router = useRouter();
  const { unreadCount, clearUnread } = useOrderRealtime(shopId);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative"
      onClick={() => {
        clearUnread();
        router.push("/vendor/orders");
      }}
    >
      <Bell className="size-4" />
      {unreadCount > 0 ? (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]"
        >
          {unreadCount}
        </Badge>
      ) : null}
    </Button>
  );
}
