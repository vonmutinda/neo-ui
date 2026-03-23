"use client";

import { use, useState } from "react";
import {
  useAdminKYBSubmission,
  useAdminReviewKYBSubmission,
  useAdminReviewKYBDocument,
} from "@/hooks/admin/use-admin-kyb";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function KYBDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: submission, isLoading } = useAdminKYBSubmission(id);
  const reviewSubmission = useAdminReviewKYBSubmission();
  const reviewDocument = useAdminReviewKYBDocument();

  const [notes, setNotes] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!submission) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        KYB submission not found
      </p>
    );
  }

  function handleApprove() {
    reviewSubmission.mutate(
      { id, decision: "approved", notes: notes.trim() || "" },
      {
        onSuccess: () => {
          toast.success("Submission approved");
          setNotes("");
        },
        onError: () => toast.error("Failed to approve submission"),
      },
    );
  }

  function handleReject() {
    reviewSubmission.mutate(
      { id, decision: "rejected", notes: notes.trim() || "" },
      {
        onSuccess: () => {
          toast.success("Submission rejected");
          setNotes("");
        },
        onError: () => toast.error("Failed to reject submission"),
      },
    );
  }

  function handleDocumentReview(
    documentId: string,
    decision: "approved" | "rejected",
  ) {
    reviewDocument.mutate(
      { id: documentId, status: decision, reviewNotes: notes.trim() || "" },
      {
        onSuccess: () => toast.success(`Document ${decision}`),
        onError: () => toast.error("Failed to review document"),
      },
    );
  }

  const documents = submission.documents ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kyb">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold">KYB Submission</h2>
          <p className="text-sm text-muted-foreground">ID: {submission.id}</p>
        </div>
        <StatusBadge status={submission.status ?? "unknown"} />
      </div>

      {/* Submission Details */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Submission Details
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Business ID</p>
            <p className="text-sm font-medium break-all">
              {submission.businessId ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{submission.status ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Submitted At</p>
            <p className="text-sm font-medium">
              {submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reviewed At</p>
            <p className="text-sm font-medium">
              {submission.reviewedAt
                ? new Date(submission.reviewedAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Documents */}
      {documents.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Documents
          </h3>
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {doc.type ?? doc.name ?? "Document"}
                  </p>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View document
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={doc.status ?? "pending"} />
                  {doc.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDocumentReview(doc.id, "approved")}
                        disabled={reviewDocument.isPending}
                      >
                        <CheckCircle className="mr-1 h-3.5 w-3.5 text-green-600" />{" "}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDocumentReview(doc.id, "rejected")}
                        disabled={reviewDocument.isPending}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5 text-destructive" />{" "}
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Actions */}
      {submission.status === "pending" && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Review Submission
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={reviewSubmission.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-1 h-4 w-4" /> Approve Submission
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={reviewSubmission.isPending}
              >
                <XCircle className="mr-1 h-4 w-4" /> Reject Submission
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
