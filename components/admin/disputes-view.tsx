"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { resolveDispute } from "@/lib/admin/dispute-actions";
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

type Dispute = Database["public"]["Tables"]["disputes"]["Row"];

function ageInDays(createdAt: string) {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  return `${days}d`;
}

export function DisputesView({ disputes }: { disputes: Dispute[] }) {
  const router = useRouter();
  const [target, setTarget] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleResolve(event: React.FormEvent) {
    event.preventDefault();
    if (!target) return;

    setSubmitting(true);
    const result = await resolveDispute(target.id, resolution);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Dispute resolved");
    setTarget(null);
    setResolution("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Raised by</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Age</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.length ? (
              disputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-xs">
                    {dispute.order_id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {dispute.raised_by.slice(0, 8)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {dispute.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {dispute.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ageInDays(dispute.created_at)}</TableCell>
                  <TableCell>
                    {dispute.status !== "resolved" ? (
                      <Button size="sm" onClick={() => setTarget(dispute)}>
                        Resolve
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No disputes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve dispute</DialogTitle>
          </DialogHeader>
          {target ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{target.reason}</p>
              <form onSubmit={handleResolve} className="space-y-4">
                <Textarea
                  required
                  placeholder="Resolution notes"
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                />
                <Button type="submit" disabled={submitting} className="w-full">
                  Mark resolved
                </Button>
              </form>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
