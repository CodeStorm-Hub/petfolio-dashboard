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

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: activeVendors },
    { count: ordersToday },
    { data: monthOrders },
    { count: openDisputes },
    { data: recentAudit },
    { data: shops },
  ] = await Promise.all([
    supabase
      .from("shops")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("marketplace_orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString()),
    supabase
      .from("marketplace_orders")
      .select("shop_id, amount_cents")
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .neq("status", "resolved"),
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("shops").select("id, shop_name, platform_fee_percent"),
  ]);

  const shopNames = Object.fromEntries(
    (shops ?? []).map((shop) => [shop.id, shop.shop_name])
  );
  const feeByShop = Object.fromEntries(
    (shops ?? []).map((shop) => [shop.id, shop.platform_fee_percent])
  );

  const gmvThisMonth = (monthOrders ?? []).reduce(
    (acc, order) => acc + order.amount_cents,
    0
  );
  const platformFeesThisMonth = (monthOrders ?? []).reduce((acc, order) => {
    const feePercent = feeByShop[order.shop_id] ?? 0;
    return acc + Math.round((order.amount_cents * feePercent) / 100);
  }, 0);

  const gmvByShop = new Map<string, number>();
  for (const order of monthOrders ?? []) {
    gmvByShop.set(order.shop_id, (gmvByShop.get(order.shop_id) ?? 0) + order.amount_cents);
  }
  const topVendors = Array.from(gmvByShop.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const adminClient = createAdminClient();
  const adminIds = Array.from(
    new Set((recentAudit ?? []).map((log) => log.admin_id))
  );
  const adminEmails = Object.fromEntries(
    await Promise.all(
      adminIds.map(async (id) => {
        const { data } = await adminClient.auth.admin.getUserById(id);
        return [id, data.user?.email ?? id.slice(0, 8)] as const;
      })
    )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Active vendors</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{activeVendors ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Orders today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{ordersToday ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">GMV this month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(gmvThisMonth / 100).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Platform fees this month
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(platformFeesThisMonth / 100).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Open disputes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{openDisputes ?? 0}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top vendors by GMV (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>GMV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topVendors.length ? (
                  topVendors.map(([shopId, gmv]) => (
                    <TableRow key={shopId}>
                      <TableCell>{shopNames[shopId] ?? shopId}</TableCell>
                      <TableCell>${(gmv / 100).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No orders this month.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAudit && recentAudit.length ? (
              recentAudit.map((log) => (
                <div key={log.id} className="flex items-start justify-between text-sm">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-muted-foreground">
                      {adminEmails[log.admin_id]} · {log.target_type} {log.target_id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {new Date(log.created_at).toLocaleDateString("en-US")}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
