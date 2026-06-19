"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import {
  approveVendorKyc,
  rejectVendorKyc,
  setShopActive,
  setShopFeatured,
  updatePlatformFeePercent,
} from "@/lib/admin/vendor-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Shop = Database["public"]["Tables"]["shops"]["Row"];

const KYC_VARIANT: Record<string, "secondary" | "destructive" | "default"> = {
  pending: "secondary",
  submitted: "default",
  approved: "default",
  rejected: "destructive",
};

export function VendorsView({
  shops,
  ownerEmails,
}: {
  shops: Shop[];
  ownerEmails: Record<string, string>;
}) {
  const router = useRouter();
  const [rejectTarget, setRejectTarget] = useState<Shop | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const submitted = useMemo(
    () => shops.filter((shop) => shop.kyc_status === "submitted"),
    [shops]
  );

  async function handleApprove(shop: Shop) {
    setBusyId(shop.id);
    const result = await approveVendorKyc(shop.id, shop.owner_id);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${shop.shop_name} approved`);
    router.refresh();
  }

  async function handleReject(event: React.FormEvent) {
    event.preventDefault();
    if (!rejectTarget) return;

    setBusyId(rejectTarget.id);
    const result = await rejectVendorKyc(rejectTarget.id, rejectionReason);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${rejectTarget.shop_name} rejected`);
    setRejectTarget(null);
    setRejectionReason("");
    router.refresh();
  }

  async function handleToggleActive(shop: Shop) {
    const result = await setShopActive(shop.id, !shop.is_active);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleToggleFeatured(shop: Shop) {
    const result = await setShopFeatured(shop.id, !shop.featured);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleFeeChange(shop: Shop, value: string) {
    const percent = parseFloat(value);
    if (Number.isNaN(percent)) return;
    const result = await updatePlatformFeePercent(shop.id, percent);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="kyc">
        <TabsList>
          <TabsTrigger value="kyc">KYC queue ({submitted.length})</TabsTrigger>
          <TabsTrigger value="all">All vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="pt-4">
          <div className="space-y-3">
            {submitted.length ? (
              submitted.map((shop) => (
                <div
                  key={shop.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div>
                    <p className="font-medium">{shop.shop_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ownerEmails[shop.owner_id] ?? shop.owner_id}
                    </p>
                    <div className="mt-2 flex gap-3 text-sm">
                      {shop.trade_license_url ? (
                        <a
                          href={shop.trade_license_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          Trade license
                        </a>
                      ) : null}
                      {shop.national_id_url ? (
                        <a
                          href={shop.national_id_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          National ID
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busyId === shop.id}
                      onClick={() => handleApprove(shop)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busyId === shop.id}
                      onClick={() => setRejectTarget(shop)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No KYC submissions pending review.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="pt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Fee %</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.length ? (
                  shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.shop_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ownerEmails[shop.owner_id] ?? shop.owner_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={KYC_VARIANT[shop.kyc_status] ?? "secondary"} className="capitalize">
                          {shop.kyc_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          defaultValue={shop.platform_fee_percent}
                          className="h-8 w-20"
                          onBlur={(event) => handleFeeChange(shop, event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={shop.is_active}
                          onCheckedChange={() => handleToggleActive(shop)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={shop.featured}
                          onCheckedChange={() => handleToggleFeatured(shop)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(shop.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No vendors yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.shop_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4">
            <Input
              required
              placeholder="Rejection reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
            />
            <Button type="submit" variant="destructive" className="w-full">
              Reject vendor
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
