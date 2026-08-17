import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  Badge,
  Button,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@website/shared/ui";
import { ProductVariantsTable } from "@/features/products/components/ProductVariantsTable";
import { useGetProductById } from "@/features/products/hooks/useProduct";
import {
  STATUS_BADGE,
  type ProductDetail as ProductDetailType,
} from "@/features/products/types/product";

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='grid gap-1 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-4'>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='text-sm text-foreground'>{children}</dd>
    </div>
  );
}

export default function ProductDetail() {
  const { productId } = useParams({
    from: "/vendor-layout/products/$productId",
  });
  const { data: product, isPending } = useGetProductById(productId);

  return (
    <div className='space-y-5'>
      <Link
        to='/products'
        className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft className='h-4 w-4' />
        Products
      </Link>

      {isPending ? (
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-72 w-full rounded-xl' />
        </div>
      ) : !product ? (
        <p className='rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground'>
          Product not found.
        </p>
      ) : (
        <ProductDetailBody product={product} />
      )}
    </div>
  );
}

function ProductDetailBody({ product }: { product: ProductDetailType }) {
  const status = STATUS_BADGE[product.status];
  const categories = product.productCategories.map((pc) => pc.category.name);

  return (
    <>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='font-display text-xl font-semibold text-foreground'>
            {product.name}
          </h1>
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
        </div>
        <Button
          variant='outline'
          render={
            <Link
              to='/products/$productId/edit'
              params={{ productId: product.id }}
            />
          }
        >
          <Pencil className='h-4 w-4' />
          Edit product
        </Button>
      </div>

      <Tabs defaultValue='details'>
        <TabsList variant='line' className='border-b border-border'>
          <TabsTrigger value='details'>Product details</TabsTrigger>
          <TabsTrigger value='variants'>
            Variants ({product.variants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='pt-4'>
          <dl className='rounded-xl border border-border bg-card shadow-sm'>
            <Row label='Name'>{product.name}</Row>
            <Row label='Brand'>{product.brand?.name || "—"}</Row>
            <Row label='Categories'>
              {categories.length ? (
                <span className='flex flex-wrap gap-1.5'>
                  {categories.map((c) => (
                    <Badge key={c} variant='secondary'>
                      {c}
                    </Badge>
                  ))}
                </span>
              ) : (
                "—"
              )}
            </Row>
            <Row label='Option names'>
              {product.optionNames.length ? (
                <span className='flex flex-wrap gap-1.5'>
                  {product.optionNames.map((o) => (
                    <Badge key={o} variant='outline'>
                      {o}
                    </Badge>
                  ))}
                </span>
              ) : (
                "—"
              )}
            </Row>
            <Row label='Created'>{date(product.createdAt)}</Row>
            <Row label='Last updated'>{date(product.updatedAt)}</Row>
          </dl>
        </TabsContent>

        <TabsContent value='variants' className='pt-4'>
          <ProductVariantsTable
            optionNames={product.optionNames}
            variants={product.variants}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
