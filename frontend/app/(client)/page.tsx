import { PixelButton } from '@/components/shared/PixelButton';
import Image from 'next/image';
import Link from 'next/link';
import heroImg from '@/public/hero-pixel.png';
import { CATEGORIES, DEALS, BEST } from '@/lib/catalog';
import { ProductCard } from '@/components/shared/ProductCard';
import {
  Zap,
  Shield,
  Truck,
  RefreshCw,
  Award,
  ChevronRight,
} from 'lucide-react';

function SectionHeader({
  eyebrow,
  title,
  accent = 'cyan',
}: {
  eyebrow: string[];
  title: string;
  accent?: 'cyan' | 'pink' | 'green' | 'yellow';
}) {
  const map = {
    cyan: 'text-neon-cyan glow-cyan',
    pink: 'text-neon-pink glow-pink',
    green: 'text-neon-green glow-green',
    yellow: 'text-neon-yellow glow-yellow',
  };
  return (
    <div className=''>
      <div
        className={`flex items-baseline gap-2 font-pixel text-[10px] ${map[accent]}`}
      >
        {eyebrow.map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
      <h2 className='mt-2 font-pixel text-2xl md:text-3xl'>{title}</h2>
    </div>
  );
}

export default function Home() {
  const accentBg = {
    cyan: 'bg-neon-cyan/10 hover:bg-neon-cyan/20 border-neon-cyan',
    pink: 'bg-neon-pink/10 hover:bg-neon-pink/20 border-neon-pink',
    green: 'bg-neon-green/10 hover:bg-neon-green/20 border-neon-green',
    yellow: 'bg-neon-yellow/10 hover:bg-neon-yellow/20 border-neon-yellow',
  } as const;

  return (
    <div className=''>
      <div className='overflow-hidden border-b-[3px] border-foreground bg-neon-pink py-2'>
        <div className='marquee-track flex w-max gap-12 whitespace-nowrap font-pixel text-[10px] text-background'>
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className='flex gap-12'>
              <span>★ FREE SHIPPING OVER $99</span>
              <span>♥ 30-DAY RETURNS</span>
              <span>▲ NEW DROPS WEEKLY</span>
              <span>● PRESS START TO SAVE 20%</span>
              <span>★ FREE SHIPPING OVER $99</span>
              <span>♥ 30-DAY RETURNS</span>
              <span>▲ NEW DROPS WEEKLY</span>
              <span>● PRESS START TO SAVE 20%</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className='relative overflow-hidden retro-grid scanlines'>
        <div className='mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24'>
          <div className='flex flex-col gap-6'>
            <span className='w-fit border-[3px] border-neon-cyan bg-neon-cyan/10 px-3 py-1 font-pixel text-[9px] text-neon-cyan glow-cyan'>
              ▶ NEW SEASON · LEVEL UP
            </span>
            <h1 className='font-pixel text-3xl leading-[1.3] text-foreground md:text-5xl'>
              UPGRADE YOUR GEAR
              <br />
              IN <span className='text-neon-cyan glow-cyan'>8-BIT</span>{' '}
              <span className='text-neon-pink glow-pink'>STYLE</span>
            </h1>
            <p className='max-w-md font-retro text-xl text-muted-foreground'>
              Smartphones, laptops, gaming rigs, components and accessories —
              handpicked tech with a retro arcade soul.
            </p>
            <div className='flex flex-wrap gap-4'>
              <Link href='/products'>
                <PixelButton variant='cyan'>► SHOP NOW</PixelButton>
              </Link>
              <Link href='/products'>
                <PixelButton variant='ghost'>VIEW DEALS</PixelButton>
              </Link>
            </div>
            <div className='mt-2 flex flex-wrap gap-6 font-retro text-base text-muted-foreground'>
              <span>
                <span className='font-pixel text-[10px] text-neon-green'>
                  2K+
                </span>{' '}
                products
              </span>
              <span>
                <span className='font-pixel text-[10px] text-neon-pink'>
                  50K+
                </span>{' '}
                players
              </span>
              <span>
                <span className='font-pixel text-[10px] text-neon-yellow'>
                  4.9★
                </span>{' '}
                rated
              </span>
            </div>
          </div>

          <div className='relative'>
            <div className='absolute -inset-4 -z-10 bg-neon-purple/20 blur-3xl' />
            <div className='pixel-border-cyan bg-card p-6'>
              <Image
                src={heroImg}
                alt='Retro pixel-art tech setup with CRT monitor, keyboard, headphones and laptop'
                width={1024}
                height={1024}
                className='h-auto w-full'
              />
              <div className='mt-4 flex items-center justify-between border-t-[3px] border-foreground pt-4'>
                <div>
                  <div className='font-pixel text-[8px] text-neon-pink'>
                    FEATURED
                  </div>
                  <div className='font-pixel text-xs text-foreground'>
                    RETRO RIG BUNDLE
                  </div>
                </div>
                <div className='font-pixel text-sm text-neon-green glow-green'>
                  $1,299
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className='mx-auto max-w-7xl px-4 py-16'>
        <SectionHeader eyebrow={['◆', 'BROWSE']} title='CATEGORIES' />
        <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href='/products'
              className={`flex flex-col items-center gap-3 border-[3px] p-6 pixel-shadow transition-transform hover:-translate-y-1 ${accentBg[c.accent]}`}
            >
              <span className='text-4xl float-pixel'>{c.icon}</span>
              <span className='text-center font-pixel text-[10px] uppercase'>
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
      {/* DEALS */}
      <section className='border-y-[3px] border-foreground bg-sidebar py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='flex items-end justify-between'>
            <SectionHeader
              eyebrow={['🔥', 'HOT DEALS']}
              title='POWER-UP SALE'
              accent='pink'
            />
            <Link
              href='/products'
              className='hidden items-center gap-1 font-pixel text-[10px] text-neon-cyan hover:glow-cyan md:flex'
            >
              SEE ALL <ChevronRight className='h-3 w-3' />
            </Link>
          </div>
          <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {DEALS.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className='mx-auto max-w-7xl px-4 py-16'>
        <SectionHeader
          eyebrow={['★', 'POPULAR']}
          title='BEST SELLERS'
          accent='green'
        />
        <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {BEST.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className='mx-auto max-w-7xl px-4 py-16'>
        <SectionHeader
          eyebrow={['◆', 'PERKS']}
          title='WHY PIXELMART'
          accent='yellow'
        />
        <div className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
          {[
            { i: Truck, t: 'FAST SHIP', d: '1–3 day delivery', c: 'cyan' },
            { i: Shield, t: 'SECURE PAY', d: 'Encrypted checkout', c: 'pink' },
            { i: Award, t: 'WARRANTY', d: 'Up to 3 years', c: 'green' },
            { i: Zap, t: 'TRUSTED', d: 'OEM authentic', c: 'yellow' },
            { i: RefreshCw, t: 'EASY RETURN', d: '30-day refunds', c: 'cyan' },
          ].map(({ i: Icon, t, d, c }) => (
            <div
              key={t}
              className={`flex flex-col items-start gap-3 border-[3px] bg-card p-5 pixel-shadow ${accentBg[c as keyof typeof accentBg]}`}
            >
              <span className='grid h-10 w-10 place-items-center border-[3px] border-foreground bg-background'>
                <Icon className='h-5 w-5' />
              </span>
              <div className='font-pixel text-[10px] text-foreground'>{t}</div>
              <div className='font-retro text-base text-muted-foreground'>
                {d}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className='mx-auto max-w-4xl px-4 py-16'>
        <div className='pixel-border-pink bg-card p-8 text-center'>
          <div className='font-pixel text-[10px] text-neon-pink glow-pink'>
            ▶ JOIN THE TECH QUEST
          </div>
          <h3 className='mt-3 font-pixel text-xl text-foreground md:text-2xl'>
            GET 20% OFF YOUR FIRST QUEST
          </h3>
          <p className='mt-3 font-retro text-lg text-muted-foreground'>
            Subscribe for drop alerts, secret codes, and pixel-only deals.
          </p>
          <form className='mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row'>
            <input
              type='email'
              placeholder='player1@email.com'
              className='h-12 flex-1 border-[3px] border-foreground bg-input px-3 font-retro text-base outline-none focus:border-neon-cyan'
            />
            <PixelButton variant='pink'>SUBSCRIBE</PixelButton>
          </form>
        </div>
      </section>
    </div>
  );
}
