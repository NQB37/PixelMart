import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Badge, Input, Button, Spinner } from "@website/shared/ui";
import { useVendorDetail } from "@/features/vendors/hooks/useVendorDetail";
import { useReviewVendor } from "@/features/vendors/hooks/useReviewVendor";
import type { ApprovalStatus } from "@/features/vendors/types/vendor";

const APPROVAL_BADGE_CLASS: Record<ApprovalStatus, string> = {
  APPROVED: "bg-success text-white",
  REJECTED: "bg-destructive text-destructive-foreground",
  PENDING: "bg-warning text-foreground",
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}

function IdPhoto({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block overflow-hidden rounded-md border border-border"
      >
        <img src={url} alt={label} className="h-40 w-full object-cover" />
      </a>
    </div>
  );
}

export default function VendorDetail() {
  const { vendorId } = useParams({ from: "/admin-layout/users/vendors/$vendorId" });
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useVendorDetail(vendorId);
  const { mutate: review, isPending, variables } = useReviewVendor(vendorId);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!vendor) {
    return <p className="text-sm text-muted-foreground">Vendor not found.</p>;
  }

  const v = vendor.verification;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate({ to: "/users/vendors" })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to vendors
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">{vendor.vendorName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{vendor.ownerEmail}</p>
        </div>
        <Badge className={APPROVAL_BADGE_CLASS[vendor.approvalStatus]}>{vendor.approvalStatus}</Badge>
      </div>

      {vendor.approvalStatus === "PENDING" && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Button
            className="bg-success text-white hover:bg-success/90"
            disabled={isPending}
            onClick={() => review({ action: "approve" })}
          >
            {isPending && variables?.action === "approve" && <Spinner />}
            Approve
          </Button>
          {!showRejectForm ? (
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setShowRejectForm(true)}
            >
              Reject
            </Button>
          ) : (
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <Input
                className="min-w-[16rem] flex-1"
                placeholder="Reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button
                className="bg-highlight text-highlight-foreground hover:bg-highlight/90"
                disabled={isPending || !rejectReason.trim()}
                onClick={() => review({ action: "reject", rejectedReason: rejectReason.trim() })}
              >
                {isPending && variables?.action === "reject" && <Spinner />}
                Confirm reject
              </Button>
            </div>
          )}
        </div>
      )}

      {vendor.approvalStatus === "REJECTED" && vendor.rejectedReason && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Rejected: {vendor.rejectedReason}
        </div>
      )}

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <DetailField label="Rating" value={vendor.rating.toFixed(1)} />
        <DetailField label="Vendor status" value={vendor.status} />
        <DetailField label="Owner" value={vendor.ownerFullName || "—"} />
        <DetailField label="Joined" value={new Date(vendor.createdAt).toLocaleDateString()} />
      </div>

      {v && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-sm font-semibold text-foreground">Verification details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <DetailField label="Recipient" value={v.recipientName} />
            <DetailField label="Phone" value={v.phone} />
            <DetailField label="Pickup address" value={`${v.street}, ${v.ward}, ${v.province}`} />
            <DetailField label="National ID" value={v.nationalId} />
            <DetailField label="Bank account" value={v.bankAccountNumber} />
            <DetailField label="Cardholder" value={v.cardHolderName} />
            <DetailField label="Card expiry" value={v.cardExpiry} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <IdPhoto label="ID front" url={v.idFrontUrl} />
            <IdPhoto label="ID back" url={v.idBackUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
