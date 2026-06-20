"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import {
  setShopActive,
  setShopFeatured,
  updatePlatformFeePercent,
} from "@/lib/admin/vendor-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Shop = Database["public"]["Tables"]["shops"]["Row"];

export function VendorDetailActions({ shop }: { shop: Shop }) {
  const router = useRouter();
  const [feeInput, setFeeInput] = useState(shop.platform_fee_percent.toString());
  const [saving, setSaving] = useState(false);

  async function handleToggleActive() {
    const result = await setShopActive(shop.id, !shop.is_active);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(shop.is_active ? "Shop suspended" : "Shop activated");
    router.refresh();
  }

  async function handleToggleFeatured() {
    const result = await setShopFeatured(shop.id, !shop.featured);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(shop.featured ? "Shop unfeatured" : "Shop featured");
    router.refresh();
  }

  async function handleFeeUpdate() {
    const percent = parseFloat(feeInput);
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      toast.error("Fee must be between 0 and 100");
      return;
    }
    setSaving(true);
    const result = await updatePlatformFeePercent(shop.id, percent);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Platform fee updated");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-6">
        <div className="flex items-center gap-3">
          <Switch
            id="active"
            checked={shop.is_active}
            onCheckedChange={handleToggleActive}
          />
          <Label htmlFor="active">Shop active</Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="featured"
            checked={shop.featured}
            onCheckedChange={handleToggleFeatured}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="fee">Platform fee %</Label>
          <Input
            id="fee"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={feeInput}
            onChange={(event) => setFeeInput(event.target.value)}
            className="h-8 w-24"
          />
          <Button
            size="sm"
            disabled={saving}
            onClick={handleFeeUpdate}
          >
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
