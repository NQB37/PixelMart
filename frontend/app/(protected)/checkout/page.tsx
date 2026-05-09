import { PixelButton } from '@/components/shared/PixelButton';
import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-10'>
      <div className='font-pixel text-[10px] text-neon-cyan glow-cyan'>
        ▶ STEP 2 OF 3
      </div>
      <h1 className='mt-2 font-pixel text-2xl'>CHECKOUT</h1>

      <div className='mt-8 grid gap-6 lg:grid-cols-[1fr_360px]'>
        <div className='space-y-6'>
          <Section title='SHIPPING INFO' accent='cyan'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Field label='FULL NAME' />
              <Field label='EMAIL' type='email' />
              <Field label='PHONE' />
              <Field label='COUNTRY' />
              <Field label='ADDRESS' className='md:col-span-2' />
              <Field label='CITY' />
              <Field label='POSTAL CODE' />
            </div>
          </Section>

          <Section title='DELIVERY METHOD' accent='pink'>
            <div className='grid gap-2 md:grid-cols-2'>
              {[
                { t: 'STANDARD', p: '$4.90 · 5–7 days' },
                { t: 'EXPRESS', p: '$9.90 · 2–3 days' },
              ].map((o, i) => (
                <label
                  key={o.t}
                  className={`flex cursor-pointer flex-col gap-1 border-[3px] p-4 pixel-shadow ${i === 0 ? 'border-neon-cyan bg-neon-cyan/10' : 'border-foreground bg-card'}`}
                >
                  <span className='font-pixel text-[10px]'>{o.t}</span>
                  <span className='font-retro text-base text-muted-foreground'>
                    {o.p}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <div className='flex flex-wrap gap-3'>
            <Link href='/cart'>
              <PixelButton variant='ghost'>← BACK TO CART</PixelButton>
            </Link>
            <Link href='/payment'>
              <PixelButton variant='green'>► CONTINUE TO PAYMENT</PixelButton>
            </Link>
          </div>
        </div>

        <aside className='h-fit border-[3px] border-foreground bg-card p-5 pixel-shadow'>
          <h3 className='font-pixel text-xs text-neon-cyan'>ORDER SUMMARY</h3>
          <dl className='mt-4 space-y-2 font-retro text-base'>
            <Row k='Subtotal' v='$2,117' />
            <Row k='Shipping' v='$9' />
            <Row k='Tax' v='$24' />
            <div className='my-3 border-t-[3px] border-dashed border-foreground' />
            <Row k='TOTAL' v='$2,150' big />
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: 'cyan' | 'pink';
  children: React.ReactNode;
}) {
  const map = { cyan: 'text-neon-cyan', pink: 'text-neon-pink' };
  return (
    <section className='border-[3px] border-foreground bg-card p-5 pixel-shadow'>
      <h3 className={`font-pixel text-xs ${map[accent]}`}>{title}</h3>
      <div className='mt-4'>{children}</div>
    </section>
  );
}
function Field({
  label,
  className = '',
  ...rest
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className='font-pixel text-[9px] text-muted-foreground'>
        {label}
      </span>
      <input
        {...rest}
        className='mt-2 h-11 w-full border-[3px] border-foreground bg-input px-3 font-retro text-lg outline-none focus:border-neon-cyan'
      />
    </label>
  );
}
function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className='flex items-center justify-between'>
      <dt className={big ? 'font-pixel text-[10px]' : 'text-muted-foreground'}>
        {k}
      </dt>
      <dd
        className={big ? 'font-pixel text-sm text-neon-green glow-green' : ''}
      >
        {v}
      </dd>
    </div>
  );
}
