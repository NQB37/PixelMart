import { PixelButton } from '@/components/shared/PixelButton';
import { Trash2, Plus, Minus } from 'lucide-react';
import { DEALS } from '@/lib/catalog';
import Link from 'next/link';

export default function CartPage() {
  const items = DEALS.slice(0, 3).map((p, i) => ({ ...p, qty: i + 1 }));
  const subtotal = items.reduce((a, p) => a + p.price * p.qty, 0);
  const shipping = 9;
  const total = subtotal + shipping;
  return (
    <div className='mx-auto max-w-7xl px-4 py-10'>
      <div className='font-pixel text-[10px] text-neon-pink'>▶ INVENTORY</div>
      <h1 className='mt-2 font-pixel text-2xl'>YOUR CART</h1>

      <div className='mt-8 grid gap-6 lg:grid-cols-[1fr_360px]'>
        <div className='space-y-4'>
          {items.map((p) => (
            <div
              key={p.id}
              className='flex items-center gap-4 border-[3px] border-foreground bg-card p-4 pixel-shadow'
            >
              <div className='grid h-20 w-20 shrink-0 place-items-center border-[3px] border-foreground bg-secondary text-3xl'>
                {p.emoji}
              </div>
              <div className='flex-1'>
                <div className='font-pixel text-[8px] text-neon-cyan'>
                  {p.category}
                </div>
                <div className='font-pixel text-[11px]'>{p.name}</div>
                <div className='mt-1 font-pixel text-sm text-neon-green glow-green'>
                  ${p.price}
                </div>
              </div>
              <div className='flex items-center border-[3px] border-foreground'>
                <button className='grid h-9 w-9 place-items-center hover:bg-neon-pink hover:text-background'>
                  <Minus className='h-3 w-3' />
                </button>
                <span className='w-10 text-center font-pixel text-[10px]'>
                  {p.qty}
                </span>
                <button className='grid h-9 w-9 place-items-center hover:bg-neon-green hover:text-background'>
                  <Plus className='h-3 w-3' />
                </button>
              </div>
              <button className='grid h-10 w-10 place-items-center border-[3px] border-foreground bg-card hover:bg-destructive hover:text-destructive-foreground'>
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>

        <aside className='h-fit border-[3px] border-foreground bg-card p-5 pixel-shadow'>
          <h3 className='font-pixel text-xs text-neon-cyan'>ORDER SUMMARY</h3>
          <dl className='mt-4 space-y-2 font-retro text-base'>
            <Row k='Subtotal' v={`$${subtotal}`} />
            <Row k='Shipping' v={`$${shipping}`} />
            <Row k='Discount' v='-$0' />
            <div className='my-3 border-t-[3px] border-dashed border-foreground' />
            <Row k='TOTAL' v={`$${total}`} big />
          </dl>
          <div className='mt-4 flex gap-2'>
            <input
              className='h-10 flex-1 border-[3px] border-foreground bg-input px-2 font-retro'
              placeholder='COUPON'
            />
            <button className='border-[3px] border-foreground bg-neon-yellow px-3 font-pixel text-[9px] text-background'>
              APPLY
            </button>
          </div>
          <Link href='/checkout'>
            <PixelButton variant='green' className='mt-4 w-full'>
              ► CHECKOUT
            </PixelButton>
          </Link>
          <Link
            href='/products'
            className='mt-3 block text-center font-pixel text-[9px] text-muted-foreground hover:text-neon-cyan'
          >
            ← CONTINUE SHOPPING
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className='flex items-center justify-between'>
      <dt className={big ? 'font-pixel text-[10px]' : 'text-muted-foreground'}>
        {k}
      </dt>
      <dd
        className={
          big
            ? 'font-pixel text-sm text-neon-green glow-green'
            : 'text-foreground'
        }
      >
        {v}
      </dd>
    </div>
  );
}
