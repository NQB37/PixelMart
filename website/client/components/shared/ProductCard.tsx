import { Badge, Card } from "@website/shared/ui";
import { LucideIcon, ShoppingCart, Star } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  badge?: string;
  icon: LucideIcon;
}

export function ProductCard({ p }: { p: Product }) {
  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;
  const Icon = p.icon;

  return (
    <Card className='group flex flex-col overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/10'>
      <div className='relative flex aspect-square items-center justify-center bg-muted'>
        <Icon
          className='h-14 w-14 text-muted-foreground/50 transition-transform group-hover:scale-105'
          strokeWidth={1}
        />
        {discount > 0 ? (
          <Badge variant='highlight' className='absolute left-2 top-2'>
            -{discount}%
          </Badge>
        ) : (
          p.badge && (
            <Badge className='absolute left-2 top-2'>{p.badge}</Badge>
          )
        )}
      </div>
      <div className='flex flex-1 flex-col gap-1.5 p-4'>
        <span className='text-xs uppercase tracking-wide text-muted-foreground'>
          {p.category}
        </span>
        <h3 className='font-display text-lg font-semibold leading-snug text-foreground line-clamp-2'>
          {p.name}
        </h3>
        <div className='flex items-center gap-1'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.round(p.rating) ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
            />
          ))}
          <span className='ml-1 text-sm text-muted-foreground'>
            ({p.rating.toFixed(1)})
          </span>
        </div>
        <div className='mt-auto flex items-end justify-between pt-2'>
          <div>
            {p.oldPrice && (
              <div className='text-sm text-muted-foreground line-through tabular-nums'>
                ${p.oldPrice}
              </div>
            )}
            <div className='font-display text-xl font-bold text-primary tabular-nums'>
              ${p.price}
            </div>
          </div>
          <button
            type='button'
            className='grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90'
            aria-label={`Add ${p.name} to cart`}
          >
            <ShoppingCart className='h-4 w-4' strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </Card>
  );
}
