import { PixelButton } from "@pixelmart/shared/ui";

const NewsletterSection = () => {
  return (
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
  );
};

export default NewsletterSection;
