import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VendorDetailActions } from "@/components/admin/vendor-detail-actions";

export const dynamic = "force-dynamic";

export default async function AdminVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!shop) notFound();

  const adminClient = createAdminClient();
  const { data: ownerData } = await adminClient.auth.admin.getUserById(
    shop.owner_id
  );
  const ownerEmail = ownerData.user?.email ?? shop.owner_id;

  const [{ data: orders }, { data: ledgers }] = await Promise.all([
    supabase
      .from("marketplace_orders")
      .select("*")
      .eq("shop_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("vendor_ledgers")
      .select("*")
      .eq("shop_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const totalGmv = (orders ?? []).reduce((acc, o) => acc + o.amount_cents, 0);
  const availableBalance = (ledgers ?? [])
    .filter((l) => l.status === "available")
    .reduce((acc, l) => acc + l.vendor_earnings_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{shop.shop_name}</h1>
          <p className="text-sm text-muted-foreground">{ownerEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={shop.is_active ? "default" : "destructive"}>
            {shop.is_active ? "Active" : "Suspended"}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            KYC: {shop.kyc_status}
          </Badge>
          {shop.featured ? <Badge>Featured</Badge> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total GMV</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(totalGmv / 100).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Available balance</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(availableBalance / 100).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total orders</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {orders?.length ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Platform fee %</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {shop.platform_fee_percent}%
          </CardContent>
        </Card>
      </div>

      <VendorDetailActions shop={shop} />

      <Card>
        <CardHeader>
          <CardTitle>Shop info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Slug</p>
            <p>{shop.slug}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p>{new Date(shop.created_at).toLocaleDateString()}</p>
          </div>
          {shop.description ? (
            <div className="col-span-2">
              <p className="text-muted-foreground">Description</p>
              <p>{shop.description}</p>
            </div>
          ) : null}
          {shop.trade_license_url ? (
            <div>
              <p className="text-muted-foreground">Trade license</p>
              <a
                href={shop.trade_license_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                View document
              </a>
            </div>
          ) : null}
          {shop.national_id_url ? (
            <div>
              <p className="text-muted-foreground">National ID</p>
              <a
                href={shop.national_id_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                View document
              </a>
            </div>
          ) : null}
          {shop.rejection_reason ? (
            <div className="col-span-2">
              <p className="text-muted-foreground">Rejection reason</p>
              <p className="text-destructive">{shop.rejection_reason}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders && orders.length ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${(order.amount_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgers && ledgers.length ? (
                ledgers.map((ledger) => (
                  <TableRow key={ledger.id}>
                    <TableCell className="font-mono text-xs">
                      {ledger.order_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      ${(ledger.order_total_cents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${(ledger.platform_fee_cents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${(ledger.vendor_earnings_cents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {ledger.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ledger.paid_at
                        ? new Date(ledger.paid_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No ledger entries yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
