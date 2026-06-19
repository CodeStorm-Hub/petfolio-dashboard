"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { createPlatformPromo, setPlatformPromoActive } from "@/lib/admin/promo-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Promo = Database["public"]["Tables"]["promos"]["Row"];

const CATEGORIES = [
  "all",
  "food",
  "gear",
  "toys",
  "treats",
  "health",
  "grooming",
  "beds",
  "apparel",
];

export function AdminPromosView({ promos }: { promos: Promo[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [category, setCategory] = useState("all");
  const [validUntil, setValidUntil] = useState("");

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const result = await createPlatformPromo({
      code: code.toUpperCase(),
      description,
      discount_type: discountType,
      discount_value: parseFloat(discountValue || "0"),
      min_order_cents: Math.round(parseFloat(minOrder || "0") * 100),
      max_discount_cents: maxDiscount ? Math.round(parseFloat(maxDiscount) * 100) : null,
      max_usage: maxUsage ? parseInt(maxUsage, 10) : null,
      category,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
    });

    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Platform promo created");
    setDialogOpen(false);
    setCode("");
    setDescription("");
    setDiscountValue("");
    setMinOrder("0");
    setMaxDiscount("");
    setMaxUsage("");
    setValidUntil("");
    router.refresh();
  }

  async function handleToggle(promo: Promo) {
    const result = await setPlatformPromoActive(promo.id, !promo.is_active);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={<Button>New platform promo</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New platform-wide promo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Code</Label>
              <Input required value={code} onChange={(event) => setCode(event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Discount type</Label>
              <Select
                value={discountType}
                onValueChange={(value) =>
                  setDiscountType((value as "percent" | "fixed") ?? "percent")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount value {discountType === "percent" ? "(%)" : "($)"}</Label>
              <Input
                required
                type="number"
                step="0.01"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Min order ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={minOrder}
                onChange={(event) => setMinOrder(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max discount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={maxDiscount}
                onChange={(event) => setMaxDiscount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max usage</Label>
              <Input
                type="number"
                value={maxUsage}
                onChange={(event) => setMaxUsage(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? "all")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Expires</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="sm:col-span-2">
              Create promo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min order</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.length ? (
              promos.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono">{promo.code}</TableCell>
                  <TableCell className="capitalize">{promo.discount_type}</TableCell>
                  <TableCell>
                    {promo.discount_type === "percent"
                      ? `${promo.discount_value}%`
                      : `$${promo.discount_value.toFixed(2)}`}
                  </TableCell>
                  <TableCell>${(promo.min_order_cents / 100).toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{promo.category}</TableCell>
                  <TableCell>
                    {promo.usage_count}
                    {promo.max_usage ? ` / ${promo.max_usage}` : ""}
                  </TableCell>
                  <TableCell>
                    <Switch checked={promo.is_active} onCheckedChange={() => handleToggle(promo)} />
                  </TableCell>
                  <TableCell>
                    {promo.valid_until ? (
                      new Date(promo.valid_until).toLocaleDateString()
                    ) : (
                      <Badge variant="secondary">No expiry</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No platform promos yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
