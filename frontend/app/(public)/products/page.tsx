import { PixelButton } from '@/components/shared/PixelButton';
import { ProductCard } from '@/components/shared/ProductCard';
import { DEALS, BEST, CATEGORIES } from '@/lib/catalog';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  const all = [
    ...DEALS,
    ...BEST,
    ...DEALS.map((p) => ({ ...p, id: p.id + 'b' })),
  ];
  return (
    <div className='mx-auto max-w-7xl px-4 py-10'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='font-pixel text-[10px] text-neon-cyan glow-cyan'>
            ◆ CATALOG
          </div>
          <h1 className='mt-2 font-pixel text-2xl md:text-3xl'>ALL PRODUCTS</h1>
        </div>
        <div className='flex gap-2'>
          <div className='relative'>
            <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              placeholder='search...'
              className='h-11 w-64 border-[3px] border-foreground bg-input pl-8 pr-2 font-retro text-base outline-none focus:border-neon-cyan'
            />
          </div>
          <select className='h-11 border-[3px] border-foreground bg-input px-2 font-retro text-base outline-none focus:border-neon-cyan'>
            <option>Newest</option>
            <option>Price ↑</option>
            <option>Price ↓</option>
            <option>Best rated</option>
          </select>
        </div>
      </div>

      <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]'>
        <aside className='space-y-6 border-[3px] border-foreground bg-card p-4 pixel-shadow'>
          <FilterGroup title='CATEGORY' items={CATEGORIES.map((c) => c.name)} />
          <FilterGroup
            title='BRAND'
            items={['ArcadeTech', 'PixelCore', 'NeonByte', 'RetroForge']}
          />
          <FilterGroup title='RATING' items={['★★★★★', '★★★★', '★★★']} />
          <div>
            <h4 className='font-pixel text-[10px] text-neon-pink'>PRICE</h4>
            <div className='mt-3 flex items-center gap-2'>
              <input
                className='h-9 w-20 border-[3px] border-foreground bg-input px-2 font-retro'
                placeholder='$0'
              />
              <span className='font-pixel text-[10px]'>—</span>
              <input
                className='h-9 w-20 border-[3px] border-foreground bg-input px-2 font-retro'
                placeholder='$2k'
              />
            </div>
          </div>
          <PixelButton variant='green' className='w-full'>
            APPLY
          </PixelButton>
        </aside>

        <div>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
            {all.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          <div className='mt-10 flex justify-center gap-2'>
            {['◀', '1', '2', '3', '▶'].map((n, i) => (
              <button
                key={i}
                className={`grid h-10 min-w-10 place-items-center border-[3px] border-foreground px-3 font-pixel text-[10px] ${n === '1' ? 'bg-neon-cyan text-background' : 'bg-card hover:bg-neon-yellow hover:text-background'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className='font-pixel text-[10px] text-neon-cyan'>{title}</h4>
      <ul className='mt-3 space-y-2'>
        {items.map((i) => (
          <li key={i} className='flex items-center gap-2 font-retro text-base'>
            <span className='grid h-4 w-4 place-items-center border-2 border-foreground bg-input' />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
