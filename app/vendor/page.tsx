import Link from "next/link";

import { getCurrentVendorShop } from "@/lib/vendor/get-shop";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/vendor/revenue-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function VendorOverviewPage() {
  const { shop } = await getCurrentVendorShop();
  if (!shop) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up your shop</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create your shop to start selling.{" "}
            <Link href="/vendor/shop" className="text-primary underline-offset-4 hover:underline">
              Go to shop setup
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: ordersToday },
    { data: monthOrders },
    { count: pendingShipments },
    { count: activeProducts },
    { data: recentOrders },
    { data: lowStockProducts },
    { data: thirtyDayOrders },
    { data: announcements },
  ] = await Promise.all([
    supabase
      .from("marketplace_orders")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .gte("created_at", startOfToday.toISOString()),
    supabase
      .from("marketplace_orders")
      .select("amount_cents")
      .eq("shop_id", shop.id)
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("marketplace_orders")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .in("status", ["pending", "processing"]),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .eq("active", true),
    supabase
      .from("marketplace_orders")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select("id, name, inventory_count")
      .eq("shop_id", shop.id)
      .eq("active", true)
      .lt("inventory_count", 5),
    supabase
      .from("marketplace_orders")
      .select("created_at, amount_cents")
      .eq("shop_id", shop.id)
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("vendor_announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const revenueThisMonth =
    monthOrders?.reduce((acc, order) => acc + order.amount_cents, 0) ?? 0;

  const revenueByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    revenueByDay.set(day.toISOString().slice(0, 10), 0);
  }
  for (const order of thirtyDayOrders ?? []) {
    const key = order.created_at.slice(0, 10);
    if (revenueByDay.has(key)) {
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.amount_cents / 100);
    }
  }
  const chartData = Array.from(revenueByDay.entries()).map(([date, revenue]) => ({
    date: date.slice(5),
    revenue,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-2">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="flex items-start gap-3 py-3">
                {announcement.is_pinned ? (
                  <Badge className="mt-0.5">Pinned</Badge>
                ) : null}
                <div>
                  <p className="text-sm font-medium">{announcement.title}</p>
                  <p className="text-sm text-muted-foreground">{announcement.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Orders today
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {ordersToday ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Revenue this month
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(revenueThisMonth / 100).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Pending shipments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {pendingShipments ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Active products
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {activeProducts ?? 0}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue, last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      {lowStockProducts && lowStockProducts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span>{product.name}</span>
                <Badge variant="destructive">{product.inventory_count} left</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders && recentOrders.length ? (
                recentOrders.map((order) => (
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
                    <TableCell>
                      <Link
                        href={`/vendor/orders/${order.id}`}
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No orders yet.
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
