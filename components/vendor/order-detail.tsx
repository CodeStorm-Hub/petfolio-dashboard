"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Printer, ExternalLink } from "lucide-react";

import type { Database } from "@/lib/types/database";
import {
  updateOrderStatus,
  addShipment,
  reviewPrescription,
  cancelOrder,
} from "@/lib/vendor/order-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const STATUS_FLOW: Record<string, string | null> = {
  pending: "processing",
  processing: null, // advance via shipment form
  shipped: "delivered",
  delivered: null,
  cancelled: null,
};

const STATUS_BADGE: Record<string, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export function OrderDetail({
  order,
  shipment,
  prescriptions,
  prescriptionImageUrls,
  shopName,
}: {
  order: Order;
  shipment: Shipment | null;
  prescriptions: Prescription[];
  prescriptionImageUrls: Record<string, string>;
  shopName: string;
}) {
  const router = useRouter();
  const [courier, setCourier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectNote, setShowRejectNote] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const lineItems = Array.isArray(order.line_items)
    ? (order.line_items as LineItem[])
    : [];

  const nextStatus = STATUS_FLOW[order.status] ?? null;
  const canCancel = order.status === "pending" || order.status === "processing";
  const addressText = formatAddress(order.shipping_address);

  async function advanceStatus() {
    if (!nextStatus) return;
    setSaving(true);
    const result = await updateOrderStatus(order.id, nextStatus);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
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
    if (result.error) { toast.error(result.error); return; }
    toast.success("Shipment added — order marked as shipped");
    router.refresh();
  }

  async function handleCancel(event: React.FormEvent) {
    event.preventDefault();
    if (!cancelReason.trim()) { toast.error("Please enter a cancellation reason"); return; }
    setSaving(true);
    const result = await cancelOrder(order.id, cancelReason);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
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
    if (result.error) { toast.error(result.error); return; }
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
    <div className="space-y-4">
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
            {new Date(order.created_at).toLocaleString()} &middot;{" "}
            {order.payment_method.replace(/_/g, " ")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={printPackingSlip}>
          <Printer className="size-4" />
          Packing slip
        </Button>
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
                          onClick={() =>
                            handlePrescription(rx.id, "rejected")
                          }
                        >
                          Confirm
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handlePrescription(rx.id, "approved")
                          }
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
              {shipment.shipped_at ? (
                <p className="text-muted-foreground">
                  Shipped{" "}
                  {new Date(shipment.shipped_at).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          ) : order.status === "processing" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add shipment details to mark this order as shipped.
              </p>
              <form
                onSubmit={handleAddShipment}
                className="grid gap-3 sm:grid-cols-3"
              >
                <div className="space-y-1.5">
                  <Label>Courier</Label>
                  <Input
                    required
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tracking ID</Label>
                  <Input
                    required
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tracking URL (optional)</Label>
                  <Input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="sm:col-span-3"
                >
                  {saving ? "Saving…" : "Save shipment & mark as shipped"}
                </Button>
              </form>
            </div>
          ) : null}

          {/* Status advance button — only for pending → processing and shipped → delivered */}
          {nextStatus && order.status !== "processing" ? (
            <Button
              onClick={advanceStatus}
              disabled={saving}
              className="capitalize"
            >
              Mark as {nextStatus}
            </Button>
          ) : null}

          {/* Delivered */}
          {order.status === "delivered" ? (
            <p className="text-sm text-muted-foreground">
              Order delivered.
            </p>
          ) : null}

          {/* Cancel section */}
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
    </div>
  );
}
