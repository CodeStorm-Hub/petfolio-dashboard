"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { resolveShopDeletion } from "@/lib/admin/shop-deletion-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

type DeletionRequest = {
  id: string;
  shop_id: string;
  reason: string | null;
  requested_at: string;
  status: string;
  shopName: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ShopDeletionsView({ requests }: { requests: DeletionRequest[] }) {
  const router = useRouter();
  const [rejectTarget, setRejectTarget] = useState<DeletionRequest | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function approve(request: DeletionRequest) {
    setBusyId(request.id);
    const result = await resolveShopDeletion(request.id, true);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`"${request.shopName}" deactivated`);
    router.refresh();
  }

  async function submitReject(event: React.FormEvent) {
    event.preventDefault();
    if (!rejectTarget) return;

    setBusyId(rejectTarget.id);
    const result = await resolveShopDeletion(rejectTarget.id, false, note);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Deletion request rejected");
    setRejectTarget(null);
    setNote("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.shopName}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {request.reason ?? "—"}
                  </TableCell>
                  <TableCell>{formatDate(request.requested_at)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === request.id}
                      onClick={() => setRejectTarget(request)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busyId === request.id}
                      onClick={() => approve(request)}
                    >
                      Approve deletion
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No pending deletion requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject deletion request</DialogTitle>
          </DialogHeader>
          {rejectTarget ? (
            <form onSubmit={submitReject} className="space-y-4">
              <Textarea
                required
                placeholder="Reason for rejection (shown to the vendor)"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <Button type="submit" disabled={!!busyId} className="w-full">
                Confirm reject
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
