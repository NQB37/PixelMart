import { PixelButton } from "@pixelmart/shared/ui";
import Image from "next/image";
import Link from "next/link";
import heroImg from "@/public/images/hero-pixel.png";

const HeroSection = () => {
  return (
    <section className='relative overflow-hidden retro-grid scanlines'>
      <div className='mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24'>
        <div className='flex flex-col gap-6'>
          <span className='w-fit border-[3px] border-neon-cyan bg-neon-cyan/10 px-3 py-1 font-pixel text-[9px] text-neon-cyan glow-cyan'>
            ▶ NEW SEASON · LEVEL UP
          </span>
          <h1 className='font-pixel text-3xl leading-[1.3] text-foreground md:text-5xl'>
            UPGRADE YOUR GEAR
            <br />
            IN <span className='text-neon-cyan glow-cyan'>8-BIT</span>{" "}
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
              </span>{" "}
              products
            </span>
            <span>
              <span className='font-pixel text-[10px] text-neon-pink'>
                50K+
              </span>{" "}
              players
            </span>
            <span>
              <span className='font-pixel text-[10px] text-neon-yellow'>
                4.9★
              </span>{" "}
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
  );
};

export default HeroSection;
