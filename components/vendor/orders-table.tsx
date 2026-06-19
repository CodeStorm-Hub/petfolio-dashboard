"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { Database } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
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

const STATUS_TABS = ["all", "pending", "processing", "shipped", "delivered"];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");

  const filteredBySearch = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.title}`.toLowerCase().includes(search.toLowerCase())
      ),
    [orders, search]
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by order ID or title..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

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
              ? filteredBySearch
              : filteredBySearch.filter((order) => order.status === status);

          return (
            <TabsContent key={status} value={status} className="pt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
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
                        <TableCell colSpan={6} className="h-24 text-center">
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
