"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { updateOrderStatusAdmin } from "@/lib/admin/order-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Order = Database["public"]["Tables"]["marketplace_orders"]["Row"];
type Shipment = Database["public"]["Tables"]["shipments"]["Row"];

const ALL_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

type LineItem = {
  product_id?: string;
  name?: string;
  quantity?: number;
  price_cents?: number;
};

export function AdminOrderDetail({
  order,
  shopName,
  shipment,
}: {
  order: Order;
  shopName: string;
  shipment: Shipment | null;
}) {
  const router = useRouter();
  const lineItems = Array.isArray(order.line_items)
    ? (order.line_items as LineItem[])
    : [];

  async function handleStatusChange(status: string) {
    const result = await updateOrderStatusAdmin(order.id, status);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Order marked ${status}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Order {order.id.slice(0, 8)}</h1>
        <Badge variant="secondary" className="capitalize">
          {order.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">Shop: {shopName}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lineItems.length ? (
              lineItems.map((item, index) => (
                <div key={item.product_id ?? index} className="flex justify-between text-sm">
                  <span>
                    {item.name ?? "Item"} x{item.quantity ?? 1}
                  </span>
                  <span>
                    ${(((item.price_cents ?? 0) * (item.quantity ?? 1)) / 100).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No line items recorded.</p>
            )}
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Total</span>
              <span>${(order.amount_cents / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {order.shipping_address ? (
              <pre className="whitespace-pre-wrap font-sans">
                {JSON.stringify(order.shipping_address, null, 2)}
              </pre>
            ) : (
              "No address on file."
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fulfillment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shipment ? (
            <div className="text-sm">
              <p>
                Courier: <span className="font-medium">{shipment.courier}</span>
              </p>
              <p>
                Tracking: <span className="font-medium">{shipment.tracking_id}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shipment recorded.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={order.status === status ? "default" : "outline"}
                className="capitalize"
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
