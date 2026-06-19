"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { requestPayout } from "@/lib/vendor/payout-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type Ledger = Database["public"]["Tables"]["vendor_ledgers"]["Row"];
type PayoutRequest = Database["public"]["Tables"]["payout_requests"]["Row"];

export function EarningsView({
  shopId,
  ledgers,
  payoutRequests,
}: {
  shopId: string;
  ledgers: Ledger[];
  payoutRequests: PayoutRequest[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bkash" | "nagad" | "bank" | "stripe">(
    "bkash"
  );
  const [accountDetails, setAccountDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { available, pendingClearance, totalPaid } = useMemo(() => {
    const sum = (status: string) =>
      ledgers
        .filter((ledger) => ledger.status === status)
        .reduce((acc, ledger) => acc + ledger.vendor_earnings_cents, 0);

    return {
      available: sum("available"),
      pendingClearance: sum("pending_clearance"),
      totalPaid: sum("paid"),
    };
  }, [ledgers]);

  async function handleRequestPayout(event: React.FormEvent) {
    event.preventDefault();
    const amountCents = Math.round(parseFloat(amount || "0") * 100);

    if (amountCents <= 0 || amountCents > available) {
      toast.error("Amount must be between 0 and your available balance");
      return;
    }

    setSubmitting(true);
    const result = await requestPayout({
      shopId,
      amountCents,
      method,
      accountDetails: { details: accountDetails },
    });
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Payout requested");
    setDialogOpen(false);
    setAmount("");
    setAccountDetails("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Available balance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(available / 100).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Pending clearance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(pendingClearance / 100).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total paid out
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ${(totalPaid / 100).toFixed(2)}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={<Button>Request payout</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request payout</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (max ${(available / 100).toFixed(2)})</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={(value) => setMethod(value as typeof method)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account details</Label>
              <Input
                required
                placeholder="Account number / IBAN"
                value={accountDetails}
                onChange={(event) => setAccountDetails(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              Submit request
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgers.length ? (
                ledgers.map((ledger) => (
                  <TableRow key={ledger.id}>
                    <TableCell className="font-mono text-xs">
                      {ledger.order_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>${(ledger.order_total_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>${(ledger.platform_fee_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>${(ledger.vendor_earnings_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {ledger.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ledger.paid_at
                        ? new Date(ledger.paid_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No ledger entries yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutRequests.length ? (
                payoutRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>${(request.amount_cents / 100).toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{request.method}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No payout requests yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
