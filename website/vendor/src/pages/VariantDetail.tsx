import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, Skeleton } from "@website/shared/ui";
import { DetailRow } from "@/features/products/components/DetailRow";
import { UpdateVariantModal } from "@/features/products/components/UpdateVariantModal";
import { DeleteVariantModal } from "@/features/products/components/DeleteVariantModal";
import { useGetMyVariantBySlug } from "@/features/products/hooks/useProduct";
import {
  STATUS_BADGE,
  type VariantDetail as VariantDetailType,
} from "@/features/products/types/product";

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function VariantDetail() {
  const { slug } = useParams({ from: "/vendor-layout/variants/$slug" });
  const { data: variant, isPending } = useGetMyVariantBySlug(slug);

  if (isPending) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-72 w-full rounded-xl' />
      </div>
    );
  }

  if (!variant) {
    return (
      <p className='rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground'>
        Variant not found.
      </p>
    );
  }

  return <VariantDetailBody variant={variant} />;
}

function VariantDetailBody({ variant }: { variant: VariantDetailType }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { product } = variant;
  const status = STATUS_BADGE[product.status];
  const options = product.optionNames
    .map((name) => `${name}: ${variant.options[name] || "—"}`)
    .join(" · ");

  return (
    <div className='space-y-5'>
      <Link
        to='/products/$productId'
        params={{ productId: product.id }}
        className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft className='h-4 w-4' />
        {product.name}
      </Link>

      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='font-display text-xl font-semibold text-foreground'>
            {options || variant.slug}
          </h1>
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            <Badge className={status.className}>{status.label}</Badge>
            <span className='font-mono text-xs text-muted-foreground'>
              {variant.sku || variant.slug}
            </span>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setIsEditing(true)}>
            <Pencil className='h-4 w-4' />
            Edit variant
          </Button>
          {/* ponytail: the server refuses to delete a product's last variant —
              let it answer instead of counting siblings here */}
          <Button variant='destructive' onClick={() => setIsDeleting(true)}>
            <Trash2 className='h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>

      <div className='grid gap-5 lg:grid-cols-[280px_1fr]'>
        <div className='space-y-3'>
          <span className='grid aspect-square w-full place-items-center overflow-hidden rounded-xl border border-border bg-secondary text-secondary-foreground'>
            {variant.thumbnail ? (
              <img
                src={variant.thumbnail}
                alt=''
                className='h-full w-full object-cover'
              />
            ) : (
              <ImageIcon className='h-8 w-8' strokeWidth={1.5} />
            )}
          </span>
          {variant.images.length > 0 && (
            <div className='grid grid-cols-4 gap-2'>
              {variant.images.map((image) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt=''
                  className='aspect-square w-full rounded-md border border-border object-cover'
                />
              ))}
            </div>
          )}
        </div>

        <dl className='rounded-xl border border-border bg-card shadow-sm'>
          <DetailRow label='Slug'>{variant.slug}</DetailRow>
          <DetailRow label='SKU'>{variant.sku || "—"}</DetailRow>
          <DetailRow label='Price'>
            <span className='font-display font-semibold tabular-nums'>
              ${variant.price.toLocaleString("en-US")}
            </span>
          </DetailRow>
          <DetailRow label='Stock'>
            <span className='tabular-nums'>{variant.stock}</span>
          </DetailRow>
          <DetailRow label='Options'>
            {product.optionNames.length ? (
              <span className='flex flex-wrap gap-1.5'>
                {product.optionNames.map((name) => (
                  <Badge key={name} variant='outline'>
                    {name}: {variant.options[name] || "—"}
                  </Badge>
                ))}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label='Description'>
            {variant.description || "—"}
          </DetailRow>
          <DetailRow label='Meta title'>{variant.metaTitle || "—"}</DetailRow>
          <DetailRow label='Meta description'>
            {variant.metaDescription || "—"}
          </DetailRow>
          <DetailRow label='Created'>{date(variant.createdAt)}</DetailRow>
          <DetailRow label='Last updated'>{date(variant.updatedAt)}</DetailRow>
        </dl>
      </div>

      {isEditing && (
        <UpdateVariantModal
          productId={product.id}
          variant={variant}
          optionNames={product.optionNames}
          open
          onOpenChange={setIsEditing}
          // the slug is the URL — a renamed one would leave this page pointing
          // at a variant that no longer answers
          onUpdated={(next) =>
            next.slug !== variant.slug &&
            navigate({ to: "/variants/$slug", params: { slug: next.slug } })
          }
        />
      )}

      {isDeleting && (
        <DeleteVariantModal
          productId={product.id}
          variant={variant}
          open
          onOpenChange={setIsDeleting}
          // the variant is gone — its own page would 404 on the next fetch
          onDeleted={() =>
            navigate({
              to: "/products/$productId",
              params: { productId: product.id },
            })
          }
        />
      )}
    </div>
  );
}
