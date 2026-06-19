"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { approvePayout, rejectPayout } from "@/lib/admin/payout-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type PayoutRequest = Database["public"]["Tables"]["payout_requests"]["Row"];

export function PayoutsView({
  payoutRequests,
  shopNames,
}: {
  payoutRequests: PayoutRequest[];
  shopNames: Record<string, string>;
}) {
  const router = useRouter();
  const [rejectTarget, setRejectTarget] = useState<PayoutRequest | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleApprove(request: PayoutRequest) {
    setBusyId(request.id);
    const result = await approvePayout(request.id, request.shop_id, request.amount_cents);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Payout approved");
    router.refresh();
  }

  async function handleReject(event: React.FormEvent) {
    event.preventDefault();
    if (!rejectTarget) return;

    setBusyId(rejectTarget.id);
    const result = await rejectPayout(rejectTarget.id, note);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Payout rejected");
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
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payoutRequests.length ? (
              payoutRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{shopNames[request.shop_id] ?? request.shop_id}</TableCell>
                  <TableCell>${(request.amount_cents / 100).toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{request.method}</TableCell>
                  <TableCell>
                    {new Date(request.requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busyId === request.id}
                          onClick={() => handleApprove(request)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === request.id}
                          onClick={() => setRejectTarget(request)}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No payout requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payout</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4">
            <Input
              required
              placeholder="Reason"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Button type="submit" variant="destructive" className="w-full">
              Reject
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
