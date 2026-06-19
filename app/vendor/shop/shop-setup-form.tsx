"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createShop } from "@/lib/vendor/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ShopSetupForm() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const result = await createShop({ shop_name: shopName, description });

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    toast.success("Shop created");
    router.refresh();
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Set up your shop</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop_name">Shop name</Label>
            <Input
              id="shop_name"
              required
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create shop"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
