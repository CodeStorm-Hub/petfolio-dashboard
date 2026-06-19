"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { createProduct, updateProduct } from "@/lib/vendor/product-actions";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImagesField } from "@/components/vendor/product-images-field";

type Product = Database["public"]["Tables"]["products"]["Row"];

const CATEGORIES = [
  "food",
  "gear",
  "toys",
  "treats",
  "health",
  "grooming",
  "beds",
  "apparel",
];

export function ProductFormDrawer({
  shopId,
  product,
  open,
  onOpenChange,
}: {
  shopId: string;
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? CATEGORIES[0],
    description: product?.description ?? "",
    tags: (product?.tags ?? []).join(", "),
    price: product ? (product.price_cents / 100).toString() : "",
    subPrice: product?.sub_price_cents
      ? (product.sub_price_cents / 100).toString()
      : "",
    inventoryCount: product ? product.inventory_count.toString() : "0",
    weightGrams: product?.weight_grams ? product.weight_grams.toString() : "",
    isRx: product?.is_rx ?? false,
    active: product?.active ?? true,
    imageUrls: product?.image_urls ?? [],
  }));
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      brand: form.brand,
      sku: form.sku || null,
      category: form.category,
      description: form.description || null,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      price_cents: Math.round(parseFloat(form.price || "0") * 100),
      sub_price_cents: form.subPrice
        ? Math.round(parseFloat(form.subPrice) * 100)
        : null,
      subscribable: Boolean(form.subPrice),
      inventory_count: parseInt(form.inventoryCount || "0", 10),
      weight_grams: form.weightGrams ? parseInt(form.weightGrams, 10) : null,
      is_rx: form.isRx,
      active: form.active,
      image_urls: form.imageUrls,
    };

    const result = product
      ? await updateProduct(product.id, payload)
      : await createProduct(shopId, payload);

    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(product ? "Product updated" : "Product created");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="ml-auto h-full w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>{product ? "Edit product" : "Add product"}</DrawerTitle>
        </DrawerHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-4"
        >
          <ProductImagesField
            shopId={shopId}
            value={form.imageUrls}
            onChange={(urls) => set("imageUrls", urls)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                required
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                required
                value={form.brand}
                onChange={(event) => set("brand", event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input
                value={form.sku}
                onChange={(event) => set("sku", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => set("category", value ?? CATEGORIES[0])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input
              value={form.tags}
              onChange={(event) => set("tags", event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => set("price", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subscription price (optional)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.subPrice}
                onChange={(event) => set("subPrice", event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Inventory count</Label>
              <Input
                type="number"
                required
                value={form.inventoryCount}
                onChange={(event) => set("inventoryCount", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (grams)</Label>
              <Input
                type="number"
                value={form.weightGrams}
                onChange={(event) => set("weightGrams", event.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isRx}
                onChange={(event) => set("isRx", event.target.checked)}
              />
              Requires prescription
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => set("active", event.target.checked)}
              />
              Active
            </label>
          </div>
        </form>
        <DrawerFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : product ? "Save changes" : "Create product"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
