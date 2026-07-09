import { SectionHeader } from "@website/shared/ui";
import {
  Cpu,
  Gamepad2,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { name: "Smartphones", icon: Smartphone },
  { name: "Laptops", icon: Laptop },
  { name: "Gaming PCs", icon: Gamepad2 },
  { name: "Components", icon: Cpu },
  { name: "Monitors", icon: Monitor },
  { name: "Keyboards", icon: Keyboard },
  { name: "Audio", icon: Headphones },
  { name: "Gaming Gear", icon: Mouse },
];

const CategoriesSection = () => {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8'>
      <SectionHeader eyebrow={["Browse"]} title='Shop by category' />
      <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
        {CATEGORIES.map(({ name, icon: Icon }) => (
          <Link
            key={name}
            href='/products'
            className='flex flex-col items-center gap-3 rounded-xl bg-secondary/50 p-6 transition-colors hover:bg-secondary'
          >
            <span className='grid h-12 w-12 place-items-center rounded-full bg-card text-primary'>
              <Icon className='h-6 w-6' strokeWidth={1.5} />
            </span>
            <span className='text-center text-sm font-medium text-foreground'>
              {name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
