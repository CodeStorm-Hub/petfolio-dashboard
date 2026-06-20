"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";

import type { Database } from "@/lib/types/database";
import {
  updateOrderStatusAdmin,
  cancelOrderAdmin,
  updateRefundStatus,
} from "@/lib/admin/order-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Order = Database["public"]["Tables"]["marketplace_orders"]["Row"];
type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

type LineItem = {
  product_id?: string;
  name?: string;
  quantity?: number;
  price_cents?: number;
};

type AddressObj = Record<string, string | undefined>;

function formatAddress(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const a = raw as AddressObj;
  return [
    a.name ?? a.full_name ?? a.recipient_name,
    a.line1 ?? a.street ?? a.address_line1 ?? a.address1,
    a.line2 ?? a.address_line2 ?? a.address2,
    [a.city, a.state ?? a.province, a.zip ?? a.postal_code ?? a.postcode]
      .filter(Boolean)
      .join(", "),
    a.country,
    a.phone,
  ]
    .filter(Boolean)
    .join("\n");
}

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const REFUND_OPTIONS: Array<{
  value: "none" | "requested" | "approved" | "processed";
  label: string;
}> = [
  { value: "none", label: "None" },
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "processed", label: "Processed" },
];

const STATUS_BADGE: Record<string, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export function AdminOrderDetail({
  order,
  shopName,
  shipment,
  prescriptions = [],
  prescriptionImageUrls = {},
}: {
  order: Order;
  shopName: string;
  shipment: Shipment | null;
  prescriptions?: Prescription[];
  prescriptionImageUrls?: Record<string, string>;
}) {
  const router = useRouter();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const lineItems = Array.isArray(order.line_items)
    ? (order.line_items as LineItem[])
    : [];
  const addressText = formatAddress(order.shipping_address);

  async function handleStatusChange(status: string) {
    if (status === "cancelled") {
      setShowCancelForm(true);
      return;
    }
    setSaving(true);
    const result = await updateOrderStatusAdmin(order.id, status);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(`Order marked ${status}`);
    router.refresh();
  }

  async function handleCancel(event: React.FormEvent) {
    event.preventDefault();
    if (!cancelReason.trim()) { toast.error("Please enter a cancellation reason"); return; }
    setSaving(true);
    const result = await cancelOrderAdmin(order.id, cancelReason);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Order cancelled");
    setShowCancelForm(false);
    router.refresh();
  }

  async function handleRefundChange(
    value: "none" | "requested" | "approved" | "processed"
  ) {
    const result = await updateRefundStatus(order.id, value);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Refund status updated");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to orders
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">
            Order {order.id.slice(0, 8)}
          </h1>
          <Badge
            variant={STATUS_BADGE[order.status] ?? "secondary"}
            className="capitalize"
          >
            {order.status}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {order.payment_status.replace(/_/g, " ")}
          </Badge>
          {order.refund_status !== "none" ? (
            <Badge variant="destructive" className="capitalize">
              Refund: {order.refund_status}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Shop: {shopName} &middot;{" "}
          {new Date(order.created_at).toLocaleString()} &middot;{" "}
          {order.payment_method.replace(/_/g, " ")}
        </p>
      </div>

      {/* Cancelled reason */}
      {order.status === "cancelled" && order.cancelled_reason ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          Cancellation reason: {order.cancelled_reason}
        </div>
      ) : null}

      {/* Buyer notes */}
      {order.buyer_notes ? (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <span className="font-medium">Buyer note: </span>
          {order.buyer_notes}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line items */}
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
                    {item.name ?? "Item"} &times; {item.quantity ?? 1}
                  </span>
                  <span>
                    $
                    {(
                      ((item.price_cents ?? 0) * (item.quantity ?? 1)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No line items recorded.
              </p>
            )}
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Total</span>
              <span>${(order.amount_cents / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {addressText ? (
              <p className="whitespace-pre-line text-muted-foreground">
                {addressText}
              </p>
            ) : (
              <p className="text-muted-foreground">No address on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="flex items-start gap-3 rounded-md border p-3">
                {prescriptionImageUrls[rx.id] ? (
                  <a
                    href={prescriptionImageUrls[rx.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    <Image
                      src={prescriptionImageUrls[rx.id]}
                      alt="Prescription"
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded border object-cover"
                    />
                  </a>
                ) : null}
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{rx.vet_name ?? "Unknown vet"}</p>
                  <Badge variant="secondary" className="capitalize">
                    {rx.status}
                  </Badge>
                  {rx.review_note ? (
                    <p className="text-muted-foreground">
                      Review note: {rx.review_note}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Fulfillment */}
      <Card>
        <CardHeader>
          <CardTitle>Fulfillment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shipment ? (
            <div className="space-y-1 text-sm">
              <p>
                Courier:{" "}
                <span className="font-medium">{shipment.courier}</span>
              </p>
              <p>
                Tracking:{" "}
                <span className="font-medium">{shipment.tracking_id}</span>
              </p>
              {shipment.tracking_url ? (
                <a
                  href={shipment.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  Track shipment
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shipment recorded.</p>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Override status</Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={order.status === status ? "default" : "outline"}
                  className="capitalize"
                  disabled={saving}
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {showCancelForm ? (
            <form onSubmit={handleCancel} className="space-y-2 border-t pt-3">
              <Textarea
                placeholder="Cancellation reason"
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={saving}
                >
                  Confirm cancel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCancelForm(false);
                    setCancelReason("");
                  }}
                >
                  Nevermind
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      {/* Refund management */}
      <Card>
        <CardHeader>
          <CardTitle>Refund</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label className="shrink-0 text-sm">Refund status</Label>
            <Select
              value={order.refund_status ?? "none"}
              onValueChange={(v) =>
                handleRefundChange(
                  v as "none" | "requested" | "approved" | "processed"
                )
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFUND_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
