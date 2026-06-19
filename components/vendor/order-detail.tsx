"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import {
  updateOrderStatus,
  addShipment,
  reviewPrescription,
} from "@/lib/vendor/order-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Order = Database["public"]["Tables"]["marketplace_orders"]["Row"];
type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

const STATUS_FLOW: Record<string, string | null> = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
  delivered: null,
};

type LineItem = {
  product_id?: string;
  name?: string;
  quantity?: number;
  price_cents?: number;
};

export function OrderDetail({
  order,
  shipment,
  prescriptions,
}: {
  order: Order;
  shipment: Shipment | null;
  prescriptions: Prescription[];
}) {
  const router = useRouter();
  const [courier, setCourier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const lineItems = Array.isArray(order.line_items)
    ? (order.line_items as LineItem[])
    : [];
  const nextStatus = STATUS_FLOW[order.status] ?? null;

  async function advanceStatus() {
    if (!nextStatus) return;

    if (nextStatus === "shipped" && !shipment) {
      toast.error("Add shipment details before marking as shipped");
      return;
    }

    setSaving(true);
    const result = await updateOrderStatus(order.id, nextStatus);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Order marked ${nextStatus}`);
    router.refresh();
  }

  async function handleAddShipment(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await addShipment(order.id, {
      courier,
      tracking_id: trackingId,
      tracking_url: trackingUrl,
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Shipment added");
    router.refresh();
  }

  async function handlePrescription(
    prescriptionId: string,
    decision: "approved" | "rejected"
  ) {
    const result = await reviewPrescription(prescriptionId, decision);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Prescription ${decision}`);
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lineItems.length ? (
              lineItems.map((item, index) => (
                <div
                  key={item.product_id ?? index}
                  className="flex justify-between text-sm"
                >
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

      {prescriptions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{prescription.vet_name ?? "Unknown vet"}</p>
                  <Badge variant="secondary" className="capitalize">
                    {prescription.status}
                  </Badge>
                </div>
                {prescription.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePrescription(prescription.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handlePrescription(prescription.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Fulfillment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <form onSubmit={handleAddShipment} className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Courier</Label>
                <Input
                  required
                  value={courier}
                  onChange={(event) => setCourier(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tracking ID</Label>
                <Input
                  required
                  value={trackingId}
                  onChange={(event) => setTrackingId(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tracking URL</Label>
                <Input
                  value={trackingUrl}
                  onChange={(event) => setTrackingUrl(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={saving} className="sm:col-span-3">
                Save shipment
              </Button>
            </form>
          )}

          {nextStatus ? (
            <Button onClick={advanceStatus} disabled={saving} className="capitalize">
              Mark as {nextStatus}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Order is delivered.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
