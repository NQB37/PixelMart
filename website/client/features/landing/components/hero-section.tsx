import { Button } from "@website/shared/ui";
import { Headphones, Laptop, Sparkles } from "lucide-react";
import Link from "next/link";

const STATS = [
  { value: "2,000+", label: "products" },
  { value: "50,000+", label: "happy customers" },
  { value: "4.9★", label: "average rating" },
];

const HeroSection = () => {
  return (
    <section className='relative overflow-hidden'>
      <div className='mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24 lg:px-8'>
        <div className='flex flex-col gap-6'>
          <span className='inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground'>
            <Sparkles className='h-3.5 w-3.5' strokeWidth={1.5} />
            New arrivals every week
          </span>
          <h1 className='font-display text-4xl font-extrabold leading-[1.1] text-foreground md:text-5xl'>
            Tech that keeps up with you.
          </h1>
          <p className='max-w-md text-lg text-muted-foreground'>
            Phones, laptops, and gear picked for performance and priced to
            make sense.
          </p>
          <div className='flex flex-wrap gap-4'>
            <Link href='/products'>
              <Button variant='default'>Shop now</Button>
            </Link>
            <Link href='/products'>
              <Button variant='ghost'>View deals</Button>
            </Link>
          </div>
          <div className='mt-2 flex flex-wrap gap-6'>
            {STATS.map((s) => (
              <div key={s.label}>
                <div className='font-display text-lg font-bold text-primary tabular-nums'>
                  {s.value}
                </div>
                <div className='text-sm text-muted-foreground'>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='relative h-80 md:h-96'>
          <div className='absolute inset-8 rounded-full bg-primary/25 blur-3xl' />
          <div className='relative flex h-full items-center justify-center rounded-[40%_60%_65%_35%/40%_45%_55%_60%] bg-gradient-to-br from-primary via-emerald-400 to-teal-300'>
            <Sparkles className='h-32 w-32 text-white/20' strokeWidth={1} />

            <div className='absolute -left-4 top-6 flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-lg -rotate-6'>
              <span className='grid h-10 w-10 place-items-center rounded-md bg-secondary text-primary'>
                <Laptop className='h-5 w-5' strokeWidth={1.5} />
              </span>
              <div>
                <div className='text-xs font-medium text-foreground'>
                  Laptop Pro 16
                </div>
                <div className='font-display text-sm font-bold text-primary tabular-nums'>
                  $1,299
                </div>
              </div>
            </div>

            <div className='absolute -right-4 bottom-8 flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-lg rotate-6'>
              <span className='grid h-10 w-10 place-items-center rounded-md bg-secondary text-primary'>
                <Headphones className='h-5 w-5' strokeWidth={1.5} />
              </span>
              <div>
                <div className='text-xs font-medium text-foreground'>
                  Wireless Buds
                </div>
                <div className='font-display text-sm font-bold text-primary tabular-nums'>
                  $59
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
