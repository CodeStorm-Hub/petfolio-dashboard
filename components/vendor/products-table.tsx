"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import type { Database } from "@/lib/types/database";
import { setProductsActive, deleteProducts } from "@/lib/vendor/product-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDrawer } from "@/components/vendor/product-form-drawer";
import { useRouter } from "next/navigation";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function ProductsTable({
  shopId,
  products,
}: {
  shopId: string;
  products: Product[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingBulk, setPendingBulk] = useState<
    "activate" | "deactivate" | "delete" | null
  >(null);

  const filtered = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.sku ?? ""} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [products, search]
  );

  const selectedIds = Object.entries(selected)
    .filter(([, checked]) => checked)
    .map(([id]) => id);

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={filtered.length > 0 && selectedIds.length === filtered.length}
            onChange={(event) => {
              const checked = event.target.checked;
              setSelected(
                checked
                  ? Object.fromEntries(filtered.map((p) => [p.id, true]))
                  : {}
              );
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={Boolean(selected[row.original.id])}
            onChange={(event) =>
              setSelected((prev) => ({
                ...prev,
                [row.original.id]: event.target.checked,
              }))
            }
          />
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "sku", header: "SKU" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "price_cents",
        header: "Price",
        cell: ({ row }) => `$${(row.original.price_cents / 100).toFixed(2)}`,
      },
      { accessorKey: "inventory_count", header: "Stock" },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "default" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(row.original);
              setDrawerOpen(true);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    [filtered, selected, selectedIds.length]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  async function handleBulk(action: "activate" | "deactivate" | "delete") {
    const result =
      action === "delete"
        ? await deleteProducts(selectedIds)
        : await setProductsActive(selectedIds, action === "activate");

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSelected({});
    toast.success("Updated");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add product
        </Button>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2 text-sm">
          {pendingBulk ? (
            <>
              <span className="text-muted-foreground">
                {pendingBulk === "delete"
                  ? `Delete ${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`
                  : `${pendingBulk === "activate" ? "Activate" : "Deactivate"} ${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"}?`}
              </span>
              <Button
                size="sm"
                variant={pendingBulk === "delete" ? "destructive" : "default"}
                onClick={() => {
                  handleBulk(pendingBulk);
                  setPendingBulk(null);
                }}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingBulk(null)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span>{selectedIds.length} selected</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingBulk("activate")}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingBulk("deactivate")}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setPendingBulk("delete")}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDrawer
        key={editing?.id ?? "new"}
        shopId={shopId}
        product={editing}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
