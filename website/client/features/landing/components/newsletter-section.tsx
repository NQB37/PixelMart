import { Input, Button } from "@website/shared/ui";

const NewsletterSection = () => {
  return (
    <section className='mx-auto max-w-4xl px-4 py-16'>
      <div className='rounded-xl bg-gradient-to-br from-primary via-emerald-400 to-teal-300 p-8 text-center text-white md:p-12'>
        <div className='text-xs font-semibold uppercase tracking-wide text-white/90'>
          Join the club
        </div>
        <h3 className='mt-3 font-display text-2xl font-bold md:text-3xl'>
          Get 10% off your first order
        </h3>
        <p className='mt-3 text-lg text-white/90'>
          Subscribe for restock alerts, price drops, and members-only deals.
        </p>
        <form className='mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row'>
          <Input
            type='email'
            placeholder='you@email.com'
            className='h-12 flex-1 bg-white/95'
          />
          <Button className='bg-highlight text-highlight-foreground hover:bg-highlight/90'>
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
