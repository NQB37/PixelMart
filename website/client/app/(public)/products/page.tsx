"use client";
import { ProductCard } from "@/components/shared/ProductCard";
import { useProducts } from "@/features/products/hooks/useProduct";
import { Skeleton } from "@website/shared/ui";

// category/rating/sold aren't on the variant API yet — fixed stats until they are.
const ProductsPage = () => {
  const { data, isLoading, isError } = useProducts();

  return (
    <section className='mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8'>
      <h1 className='font-display text-3xl font-bold text-foreground'>
        Products
      </h1>

      {isError && (
        <p className='mt-8 text-destructive'>Failed to load products.</p>
      )}

      <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='aspect-[3/4] w-full rounded-xl' />
            ))
          : data?.map((v) => (
              <ProductCard
                key={v.id}
                p={{
                  id: v.id,
                  name: v.name,
                  category: "Gaming Gear",
                  price: v.price,
                  rating: 4.5,
                  reviews: 128,
                  sold: 1250,
                  thumbnail: v.thumbnail,
                }}
              />
            ))}
      </div>

      {!isLoading && !isError && data?.length === 0 && (
        <p className='mt-8 text-muted-foreground'>No products yet.</p>
      )}
    </section>
  );
};

export default ProductsPage;
