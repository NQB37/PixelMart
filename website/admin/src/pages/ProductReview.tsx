import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Badge, Input, Button, Spinner } from "@website/shared/ui";
import {
  useProductDetail,
  useReviewProduct,
} from "@/features/products/hooks/useProducts";
import type { ApprovalStatus } from "@/features/products/types/product";

const APPROVAL_BADGE_CLASS: Record<ApprovalStatus, string> = {
  APPROVED: "bg-success text-white",
  REJECTED: "bg-destructive text-destructive-foreground",
  PENDING: "bg-warning text-foreground",
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className='mt-0.5 text-sm text-foreground'>{value}</p>
    </div>
  );
}

export default function ProductReview() {
  const { productId } = useParams({
    from: "/admin-layout/catalog/review-queue/$productId",
  });
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductDetail(productId);
  const { mutate: review, isPending, variables } = useReviewProduct(productId);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading…</p>;
  }
  if (!product) {
    return <p className='text-sm text-muted-foreground'>Product not found.</p>;
  }

  const categories = product.productCategories
    .map((pc) => pc.category.name)
    .join(", ");
  const gallery = product.thumbnail
    ? [{ id: "thumbnail", url: product.thumbnail }, ...product.images]
    : product.images;

  return (
    <div className='space-y-6'>
      <button
        type='button'
        onClick={() => navigate({ to: "/catalog/review-queue" })}
        className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft className='h-4 w-4' /> Back to review queue
      </button>

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-display text-xl font-semibold text-foreground'>
            {product.name}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            by {product.vendor.vendorName}
          </p>
        </div>
        <Badge className={APPROVAL_BADGE_CLASS[product.approvalStatus]}>
          {product.approvalStatus}
        </Badge>
      </div>

      {product.approvalStatus === "PENDING" && (
        <div className='flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4'>
          <Button
            className='bg-success text-white hover:bg-success/90'
            disabled={isPending}
            onClick={() => review({ action: "approve" })}
          >
            {isPending && variables?.action === "approve" && <Spinner />}
            Approve
          </Button>
          {!showRejectForm ? (
            <Button
              variant='ghost'
              className='text-destructive hover:bg-destructive/10'
              onClick={() => setShowRejectForm(true)}
            >
              Reject
            </Button>
          ) : (
            <div className='flex flex-1 flex-wrap items-center gap-2'>
              <Input
                className='min-w-[16rem] flex-1'
                placeholder='Reason for rejection'
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button
                className='bg-highlight text-highlight-foreground hover:bg-highlight/90'
                disabled={isPending || !rejectReason.trim()}
                onClick={() =>
                  review({
                    action: "reject",
                    rejectedReason: rejectReason.trim(),
                  })
                }
              >
                {isPending && variables?.action === "reject" && <Spinner />}
                Confirm reject
              </Button>
            </div>
          )}
        </div>
      )}

      {product.approvalStatus === "REJECTED" && product.rejectedReason && (
        <div className='rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          Rejected: {product.rejectedReason}
        </div>
      )}

      <div className='grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2'>
        <DetailField label='Slug' value={product.slug} />
        <DetailField label='SKU' value={product.sku || "—"} />
        <DetailField label='Brand' value={product.brand?.name || "—"} />
        <DetailField label='Categories' value={categories || "—"} />
        <DetailField label='Product status' value={product.status} />
        <DetailField
          label='Submitted'
          value={new Date(product.createdAt).toLocaleDateString()}
        />
      </div>

      <div className='rounded-xl border border-border bg-card p-4'>
        <h2 className='font-display text-sm font-semibold text-foreground'>
          Description
        </h2>
        <p className='mt-2 whitespace-pre-line text-sm text-foreground'>
          {product.description || "No description provided."}
        </p>
      </div>

      {gallery.length > 0 && (
        <div className='rounded-xl border border-border bg-card p-4'>
          <h2 className='font-display text-sm font-semibold text-foreground'>
            Images
          </h2>
          <div className='mt-3 grid gap-4 sm:grid-cols-3'>
            {gallery.map((image) => (
              <a
                key={image.id}
                href={image.url}
                target='_blank'
                rel='noreferrer'
                className='block overflow-hidden rounded-md border border-border'
              >
                <img
                  src={image.url}
                  alt=''
                  className='h-40 w-full object-cover'
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {(product.metaTitle || product.metaDescription) && (
        <div className='grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2'>
          <DetailField label='Meta title' value={product.metaTitle || "—"} />
          <DetailField
            label='Meta description'
            value={product.metaDescription || "—"}
          />
        </div>
      )}
    </div>
  );
}
