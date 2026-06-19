"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { upsertPlatformSetting } from "@/lib/admin/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Setting = Database["public"]["Tables"]["platform_settings"]["Row"];

function settingValue<T>(settings: Setting[], key: string, fallback: T): T {
  const found = settings.find((setting) => setting.key === key);
  return found ? (found.value as T) : fallback;
}

export function SettingsView({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [feePercent, setFeePercent] = useState(
    String(settingValue(settings, "default_platform_fee_percent", 10))
  );
  const [categories, setCategories] = useState(
    settingValue<string[]>(settings, "allowed_categories", []).join(", ")
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    settingValue(settings, "maintenance_mode", false)
  );
  const [saving, setSaving] = useState<string | null>(null);

  async function save(key: string, value: unknown, after?: () => void) {
    setSaving(key);
    const result = await upsertPlatformSetting(key, value as never);
    setSaving(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Setting saved");
    after?.();
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Default platform fee</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-2">
          <div className="space-y-2">
            <Label>Percent</Label>
            <Input
              type="number"
              step="0.1"
              value={feePercent}
              onChange={(event) => setFeePercent(event.target.value)}
            />
          </div>
          <Button
            disabled={saving === "default_platform_fee_percent"}
            onClick={() =>
              save("default_platform_fee_percent", parseFloat(feePercent || "0"))
            }
          >
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allowed categories</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label>Comma-separated</Label>
            <Input value={categories} onChange={(event) => setCategories(event.target.value)} />
          </div>
          <Button
            disabled={saving === "allowed_categories"}
            onClick={() =>
              save(
                "allowed_categories",
                categories.split(",").map((item) => item.trim()).filter(Boolean)
              )
            }
          >
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance mode</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Switch
            checked={maintenanceMode}
            onCheckedChange={(checked) => {
              setMaintenanceMode(checked);
              save("maintenance_mode", checked);
            }}
          />
          <span className="text-sm text-muted-foreground">
            {maintenanceMode ? "Marketplace is in maintenance mode" : "Marketplace is live"}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
