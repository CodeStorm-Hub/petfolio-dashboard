"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Printer,
  ExternalLink,
  CheckCircle2,
  Circle,
  Package,
  Truck,
  XCircle,
  MapPin,
  User,
  CreditCard,
  Hash,
  Mail,
} from "lucide-react";

import type { Database } from "@/lib/types/database";
import {
  updateOrderStatus,
  addShipment,
  reviewPrescription,
  cancelOrder,
  markDelivered,
} from "@/lib/vendor/order-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Order = Database["public"]["Tables"]["marketplace_orders"]["Row"];
type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

type BuyerUser = {
  display_name: string;
  username: string;
  avatar_url: string | null;
  location: string | null;
  email?: string | null;
};

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

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"] as const;

const STATUS_BADGE: Record<string, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
        <XCircle className="size-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">
          Order Cancelled
        </span>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(
    status as (typeof STATUS_STEPS)[number]
  );

  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 bg-background text-muted-foreground/50"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Circle className="size-3.5" />
                )}
              </div>
              <span
                className={`text-xs capitalize ${
                  isCurrent
                    ? "font-semibold text-primary"
                    : isDone
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`mb-4 mx-1 h-0.5 flex-1 ${
                  i < currentIndex ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderDetail({
  order,
  shipment,
  prescriptions,
  prescriptionImageUrls,
  shopName,
  buyer,
}: {
  order: Order;
  shipment: Shipment | null;
  prescriptions: Prescription[];
  prescriptionImageUrls: Record<string, string>;
  shopName: string;
  buyer: BuyerUser | null;
}) {
  const router = useRouter();
  const [courier, setCourier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectNote, setShowRejectNote] = useState<
    Record<string, boolean>
  >({});
  const [saving, setSaving] = useState(false);

  const lineItems = Array.isArray(order.line_items)
    ? (order.line_items as LineItem[])
    : [];

  const addressText = formatAddress(order.shipping_address);
  const canCancel =
    order.status === "pending" || order.status === "processing";

  async function advanceStatus(targetStatus: string) {
    setSaving(true);
    const result = await updateOrderStatus(order.id, targetStatus);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Order marked ${targetStatus}`);
    router.refresh();
  }

  async function handleAddShipment(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await addShipment(order.id, {
      courier,
      tracking_id: trackingId,
      tracking_url: trackingUrl,
      estimated_delivery_at: estimatedDelivery || undefined,
      delivery_notes: deliveryNotes || undefined,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Shipment added — order marked as shipped");
    router.refresh();
  }

  async function handleMarkDelivered() {
    setSaving(true);
    const result = await markDelivered(order.id);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Order marked as delivered");
    router.refresh();
  }

  async function handleCancel(event: React.FormEvent) {
    event.preventDefault();
    if (!cancelReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }
    setSaving(true);
    const result = await cancelOrder(order.id, cancelReason);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Order cancelled");
    setShowCancelForm(false);
    router.refresh();
  }

  async function handlePrescription(
    prescriptionId: string,
    decision: "approved" | "rejected"
  ) {
    const note = rejectNotes[prescriptionId];
    if (decision === "rejected" && !note?.trim()) {
      setShowRejectNote((prev) => ({ ...prev, [prescriptionId]: true }));
      return;
    }
    const result = await reviewPrescription(prescriptionId, decision, note);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Prescription ${decision}`);
    router.refresh();
  }

  function printPackingSlip() {
    const win = window.open("", "_blank", "width=700,height=900");
    if (!win) return;
    const html = `<!DOCTYPE html><html><head><title>Packing Slip — ${order.id.slice(0, 8)}</title>
    <style>body{font-family:sans-serif;padding:32px;color:#111}h1{font-size:20px;margin-bottom:4px}
    .meta{color:#666;font-size:13px;margin-bottom:24px}.section{margin-bottom:24px}
    .section h2{font-size:14px;font-weight:600;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    td,th{padding:6px 8px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}
    .total{font-weight:600}.address{white-space:pre-line;font-size:13px}
    @media print{button{display:none}}</style></head><body>
    <h1>Packing Slip</h1>
    <div class="meta">Order ${order.id.slice(0, 8)} &nbsp;·&nbsp; Shop: ${shopName} &nbsp;·&nbsp; ${new Date(order.created_at).toLocaleDateString()}</div>
    <div class="section"><h2>Ship to</h2><div class="address">${addressText || "No address on file"}</div></div>
    <div class="section"><h2>Items</h2><table><tr><th>Item</th><th>Qty</th><th>Price</th></tr>
    ${lineItems.map((item) => `<tr><td>${item.name ?? "Item"}</td><td>${item.quantity ?? 1}</td><td>$${(((item.price_cents ?? 0) * (item.quantity ?? 1)) / 100).toFixed(2)}</td></tr>`).join("")}
    <tr class="total"><td colspan="2">Total</td><td>$${(order.amount_cents / 100).toFixed(2)}</td></tr></table></div>
    <button onclick="window.print()">Print</button></body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/vendor/orders"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to orders
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">
              Order{" "}
              <span className="font-mono text-xl">
                {order.id.slice(0, 8).toUpperCase()}
              </span>
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
            Placed {new Date(order.created_at).toLocaleString()} &middot; Last
            updated {new Date(order.updated_at).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={printPackingSlip}>
          <Printer className="size-4" />
          Packing slip
        </Button>
      </div>

      {/* Alert banners */}
      {order.status === "cancelled" && order.cancelled_reason ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <span className="font-medium">Cancelled:</span>{" "}
          {order.cancelled_reason}
          {order.cancelled_at ? (
            <span className="ml-2 text-muted-foreground">
              · {new Date(order.cancelled_at).toLocaleString()}
            </span>
          ) : null}
        </div>
      ) : null}

      {order.buyer_notes ? (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <span className="font-medium">Buyer note: </span>
          {order.buyer_notes}
        </div>
      ) : null}

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline status={order.status} />
        </CardContent>
      </Card>

      {/* Customer & Payment */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {buyer ? (
              <>
                <div className="flex items-center gap-3">
                  {buyer.avatar_url ? (
                    <img
                      src={buyer.avatar_url}
                      alt={buyer.display_name}
                      className="size-10 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {buyer.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{buyer.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{buyer.username}
                    </p>
                  </div>
                </div>
                {buyer.email ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>{buyer.email}</span>
                  </div>
                ) : null}
                {buyer.location ? (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>{buyer.location}</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="size-3" />
                  <span className="font-mono">{order.buyer_id}</span>
                </div>
              </>
            ) : (
              <p className="font-mono text-sm text-muted-foreground">
                {order.buyer_id}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium capitalize">
                {order.payment_method.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary" className="capitalize text-xs">
                {order.payment_status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">
                {order.currency.toUpperCase()} $
                {(order.amount_cents / 100).toFixed(2)}
              </span>
            </div>
            {order.refund_status !== "none" ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refund</span>
                <Badge variant="destructive" className="capitalize text-xs">
                  {order.refund_status}
                </Badge>
              </div>
            ) : null}
            {order.stripe_payment_intent_id ||
            order.stripe_checkout_session_id ||
            order.sslcommerz_transaction_id ? (
              <>
                <Separator />
                {order.stripe_payment_intent_id ? (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0 text-muted-foreground">
                      Stripe PI
                    </span>
                    <span className="truncate font-mono text-xs">
                      {order.stripe_payment_intent_id}
                    </span>
                  </div>
                ) : null}
                {order.stripe_checkout_session_id ? (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0 text-muted-foreground">
                      Stripe CS
                    </span>
                    <span className="truncate font-mono text-xs">
                      {order.stripe_checkout_session_id}
                    </span>
                  </div>
                ) : null}
                {order.sslcommerz_transaction_id ? (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0 text-muted-foreground">
                      SSLCommerz
                    </span>
                    <span className="truncate font-mono text-xs">
                      {order.sslcommerz_transaction_id}
                    </span>
                  </div>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Line Items & Shipping Address */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="size-4" />
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lineItems.length ? (
              lineItems.map((item, index) => (
                <div
                  key={`${item.product_id ?? "item"}-${index}`}
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
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>${(order.amount_cents / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4" />
              Shipping Address
            </CardTitle>
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

      {/* Fulfillment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="size-4" />
            Fulfillment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing shipment details */}
          {shipment ? (
            <div className="rounded-md border bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-semibold">Shipment Details</p>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                {shipment.courier ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Courier</p>
                    <p className="font-medium">{shipment.courier}</p>
                  </div>
                ) : null}
                {shipment.tracking_id ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Tracking ID</p>
                    <p className="font-mono font-medium">{shipment.tracking_id}</p>
                  </div>
                ) : null}
                {shipment.status ? (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Shipment Status
                    </p>
                    <p className="font-medium capitalize">{shipment.status}</p>
                  </div>
                ) : null}
                {shipment.shipped_at ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Shipped At</p>
                    <p className="font-medium">
                      {new Date(shipment.shipped_at).toLocaleString()}
                    </p>
                  </div>
                ) : null}
                {shipment.estimated_delivery_at ? (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Est. Delivery
                    </p>
                    <p className="font-medium">
                      {new Date(
                        shipment.estimated_delivery_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ) : null}
              </div>
              {shipment.delivery_notes ? (
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">
                    Delivery Notes
                  </p>
                  <p className="mt-0.5">{shipment.delivery_notes}</p>
                </div>
              ) : null}
              {shipment.tracking_url ? (
                <a
                  href={shipment.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                >
                  Track shipment
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          ) : null}

          {/* Status-specific action */}
          {order.status === "pending" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Confirm you&apos;ve received this order and are ready to process
                it.
              </p>
              <Button
                onClick={() => advanceStatus("processing")}
                disabled={saving}
              >
                {saving ? "Saving…" : "Accept & Mark as Processing"}
              </Button>
            </div>
          ) : order.status === "processing" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter shipment details to mark this order as shipped.
              </p>
              <form onSubmit={handleAddShipment} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>
                      Courier <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="e.g. FedEx, DHL, Pathao"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      Tracking ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="e.g. 1Z999AA10123456784"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tracking URL</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estimated Delivery Date</Label>
                    <Input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Notes</Label>
                  <Textarea
                    placeholder="Special delivery instructions…"
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save Shipment & Mark as Shipped"}
                </Button>
              </form>
            </div>
          ) : order.status === "shipped" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Confirm the order has been delivered to the customer.
              </p>
              <Button onClick={handleMarkDelivered} disabled={saving}>
                {saving ? "Saving…" : "Mark as Delivered"}
              </Button>
            </div>
          ) : order.status === "delivered" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-green-500" />
              Order successfully delivered.
            </div>
          ) : order.status === "cancelled" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="size-4 text-destructive" />
              This order has been cancelled.
            </div>
          ) : null}

          {/* Cancel */}
          {canCancel ? (
            <div className="border-t pt-4">
              {showCancelForm ? (
                <form onSubmit={handleCancel} className="space-y-2">
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
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setShowCancelForm(true)}
                >
                  Cancel order
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Prescriptions */}
      {prescriptions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {rx.vet_name ?? "Unknown vet"}
                    </p>
                    <Badge variant="secondary" className="capitalize">
                      {rx.status}
                    </Badge>
                  </div>
                  {prescriptionImageUrls[rx.id] ? (
                    <a
                      href={prescriptionImageUrls[rx.id]}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={prescriptionImageUrls[rx.id]}
                        alt="Prescription"
                        className="h-16 w-16 rounded border object-cover"
                      />
                    </a>
                  ) : null}
                </div>

                {rx.review_note ? (
                  <p className="text-sm text-muted-foreground">
                    Review note: {rx.review_note}
                  </p>
                ) : null}

                {rx.status === "pending" ? (
                  <div className="space-y-2">
                    {showRejectNote[rx.id] ? (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Rejection reason (required)"
                          rows={2}
                          value={rejectNotes[rx.id] ?? ""}
                          onChange={(e) =>
                            setRejectNotes((prev) => ({
                              ...prev,
                              [rx.id]: e.target.value,
                            }))
                          }
                          className="flex-1 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handlePrescription(rx.id, "rejected")}
                        >
                          Confirm
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePrescription(rx.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setShowRejectNote((prev) => ({
                              ...prev,
                              [rx.id]: true,
                            }))
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
