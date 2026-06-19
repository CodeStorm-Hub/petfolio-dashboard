"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { reviewPrescriptionAdmin } from "@/lib/admin/prescription-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

export function PrescriptionsView({
  prescriptions,
  orderLabels,
  fileUrls,
}: {
  prescriptions: Prescription[];
  orderLabels: Record<string, string>;
  fileUrls: Record<string, string>;
}) {
  const router = useRouter();

  async function handleDecision(
    prescription: Prescription,
    decision: "approved" | "rejected"
  ) {
    const result = await reviewPrescriptionAdmin(prescription.id, decision);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Prescription ${decision}`);
    router.refresh();
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Vet</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>File</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.length ? (
            prescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell className="text-sm">
                  {orderLabels[prescription.order_id] ?? prescription.order_id.slice(0, 8)}
                </TableCell>
                <TableCell>{prescription.vet_name ?? "—"}</TableCell>
                <TableCell>
                  {new Date(prescription.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {prescription.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {fileUrls[prescription.id] ? (
                    <a
                      href={fileUrls[prescription.id]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {prescription.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleDecision(prescription, "approved")}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDecision(prescription, "rejected")}
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
                No prescriptions pending review.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
