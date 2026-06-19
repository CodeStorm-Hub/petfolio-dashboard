"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Order = Database["public"]["Tables"]["marketplace_orders"]["Row"];

export function useOrderRealtime(shopId: string | undefined) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!shopId) return;

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`shop:${shopId}`, { config: { private: true } })
      .on(
        "broadcast",
        { event: "INSERT" },
        (message) => {
          const order = message.payload.record as Order;
          toast.success(`New order — $${(order.amount_cents / 100).toFixed(2)}`, {
            description: `Order ${order.id.slice(0, 8)}`,
            action: {
              label: "View",
              onClick: () => router.push(`/vendor/orders/${order.id}`),
            },
          });
          setUnreadCount((count) => count + 1);
          router.refresh();
        }
      )
      .on(
        "broadcast",
        { event: "UPDATE" },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, router]);

  return { unreadCount, clearUnread: () => setUnreadCount(0) };
}
