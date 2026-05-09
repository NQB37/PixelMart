import { Star, ShoppingCart } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  badge?: string;
  emoji: string;
  accent: 'cyan' | 'pink' | 'green' | 'yellow';
}

const accentMap = {
  cyan: 'pixel-border-cyan',
  pink: 'pixel-border-pink',
  green: 'pixel-border-green',
  yellow: 'pixel-border',
};

export function ProductCard({ p }: { p: Product }) {
  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;
  return (
    <div
      className={`group relative flex flex-col bg-card transition-transform hover:-translate-y-1 ${accentMap[p.accent]}`}
    >
      {p.badge && (
        <span className='absolute left-2 top-2 z-10 bg-neon-pink px-2 py-1 font-pixel text-[8px] text-background pixel-border'>
          {p.badge}
        </span>
      )}
      {discount > 0 && (
        <span className='absolute right-2 top-2 z-10 bg-neon-yellow px-2 py-1 font-pixel text-[8px] text-background pixel-border'>
          -{discount}%
        </span>
      )}
      <div className='flex h-44 items-center justify-center bg-linear-to-br from-secondary to-muted text-6xl'>
        <span className='float-pixel'>{p.emoji}</span>
      </div>
      <div className='flex flex-1 flex-col gap-2 border-t-[3px] border-foreground p-4'>
        <span className='font-pixel text-[8px] uppercase text-neon-cyan'>
          {p.category}
        </span>
        <h3 className='font-pixel text-[11px] leading-snug text-foreground'>
          {p.name}
        </h3>
        <div className='flex items-center gap-1'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.round(p.rating) ? 'fill-neon-yellow text-neon-yellow' : 'text-muted-foreground'}`}
            />
          ))}
          <span className='ml-1 font-retro text-sm text-muted-foreground'>
            ({p.rating.toFixed(1)})
          </span>
        </div>
        <div className='mt-auto flex items-end justify-between pt-2'>
          <div>
            {p.oldPrice && (
              <div className='font-retro text-base text-muted-foreground line-through'>
                ${p.oldPrice}
              </div>
            )}
            <div className='font-pixel text-sm text-neon-green glow-green'>
              ${p.price}
            </div>
          </div>
          <button className='grid h-10 w-10 place-items-center border-[3px] border-foreground bg-neon-cyan text-background hover:bg-neon-pink'>
            <ShoppingCart className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
