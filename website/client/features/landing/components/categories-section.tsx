import { SectionHeader } from "@pixelmart/shared/ui";
import Link from "next/link";
import { accentBg } from "../libs/share";

const CategoriesSection = () => {
  const CATEGORIES = [
    { name: "Smartphones", icon: "📱", accent: "cyan" },
    { name: "Laptops", icon: "💻", accent: "pink" },
    { name: "Gaming PCs", icon: "🖥️", accent: "green" },
    { name: "Components", icon: "🧠", accent: "yellow" },
    { name: "Monitors", icon: "📺", accent: "cyan" },
    { name: "Keyboards", icon: "⌨️", accent: "pink" },
    { name: "Audio", icon: "🎧", accent: "green" },
    { name: "Gaming Gear", icon: "🕹️", accent: "yellow" },
  ];

  return (
    <section className='mx-auto max-w-7xl px-4 py-16'>
      <SectionHeader eyebrow={["◆", "BROWSE"]} title='CATEGORIES' />
      <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
        {CATEGORIES.map((category) => (
          <Link
            key={category.name}
            href='/products'
            className={`flex flex-col items-center gap-3 border-[3px] p-6 pixel-shadow transition-transform hover:-translate-y-1 ${accentBg[category.accent as keyof typeof accentBg]}`}
          >
            <span className='text-4xl float-pixel'>{category.icon}</span>
            <span className='text-center font-pixel text-[10px] uppercase'>
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
