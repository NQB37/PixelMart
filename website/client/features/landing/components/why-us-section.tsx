import SectionHeader from "@/components/ui/sectionHeader";
import { Award, RefreshCw, Shield, Truck, Zap } from "lucide-react";
import { accentBg } from "../libs/share";

const WhyUsSection = () => {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16'>
      <SectionHeader
        eyebrow={["◆", "PERKS"]}
        title='WHY PIXELMART'
        accent='yellow'
      />
      <div className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {[
          { i: Truck, t: "FAST SHIP", d: "1–3 day delivery", c: "cyan" },
          { i: Shield, t: "SECURE PAY", d: "Encrypted checkout", c: "pink" },
          { i: Award, t: "WARRANTY", d: "Up to 3 years", c: "green" },
          { i: Zap, t: "TRUSTED", d: "OEM authentic", c: "yellow" },
          { i: RefreshCw, t: "EASY RETURN", d: "30-day refunds", c: "cyan" },
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
  );
};

export default WhyUsSection;
