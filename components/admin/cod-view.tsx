"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { markCashReceived } from "@/lib/admin/cod-actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CodOrder = {
  id: string;
  shop_id: string;
  amount_cents: number;
  created_at: string;
  shopName: string;
};

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CodView({ orders }: { orders: CodOrder[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function markReceived(order: CodOrder) {
    setBusyId(order.id);
    const result = await markCashReceived(order.id);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Cash collection recorded");
    router.refresh();
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Delivered</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell className="font-medium">{order.shopName}</TableCell>
                <TableCell>{formatMoney(order.amount_cents)}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled={busyId === order.id}
                    onClick={() => markReceived(order)}
                  >
                    Mark cash received
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No COD orders pending reconciliation.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
