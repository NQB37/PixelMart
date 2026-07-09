import { Card, SectionHeader } from "@website/shared/ui";
import { Award, RefreshCw, Shield, Truck, Zap } from "lucide-react";

const PERKS = [
  { icon: Truck, title: "Fast shipping", desc: "1–3 day delivery" },
  { icon: Shield, title: "Secure payments", desc: "Encrypted checkout" },
  { icon: Award, title: "Extended warranty", desc: "Up to 3 years" },
  { icon: Zap, title: "Trusted brands", desc: "100% authentic" },
  { icon: RefreshCw, title: "Easy returns", desc: "30-day refunds" },
];

const WhyUsSection = () => {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8'>
      <SectionHeader eyebrow={["Perks"]} title='Why PixelMart' accent='yellow' />
      <div className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {PERKS.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className='flex flex-col items-start gap-3 p-5'>
            <span className='grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary'>
              <Icon className='h-5 w-5' strokeWidth={1.5} />
            </span>
            <div className='font-display text-sm font-semibold text-foreground'>
              {title}
            </div>
            <div className='text-sm text-muted-foreground'>{desc}</div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default WhyUsSection;
