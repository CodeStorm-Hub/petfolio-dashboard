"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

import type { Database } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Order = Database["public"]["Tables"]["marketplace_orders"]["Row"];

const STATUS_TABS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export function AdminOrdersTable({
  orders,
  shopNames,
}: {
  orders: Order[];
  shopNames: Record<string, string>;
}) {
  const [search, setSearch] = useState("");

  function exportCsv(rows: Order[]) {
    const header = [
      "order_id",
      "shop",
      "date",
      "amount",
      "payment_method",
      "payment_status",
      "status",
      "refund_status",
    ];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csvRows = rows.map((o) =>
      [
        o.id,
        shopNames[o.shop_id] ?? "",
        new Date(o.created_at).toISOString(),
        (o.amount_cents / 100).toFixed(2),
        o.payment_method,
        o.payment_status,
        o.status,
        o.refund_status ?? "none",
      ]
        .map(String)
        .map(escape)
        .join(",")
    );
    const blob = new Blob([[header.join(","), ...csvRows].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.title} ${shopNames[order.shop_id] ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [orders, search, shopNames]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by order ID, title, or shop..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCsv(filtered)}
          className="ml-auto shrink-0"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          {STATUS_TABS.map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((status) => {
          const rows =
            status === "all"
              ? filtered
              : filtered.filter((order) => order.status === status);

          return (
            <TabsContent key={status} value={status} className="pt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length ? (
                      rows.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{shopNames[order.shop_id] ?? "—"}</TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            ${(order.amount_cents / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {order.payment_method.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-sm text-primary underline-offset-4 hover:underline"
                            >
                              View
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No orders.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
