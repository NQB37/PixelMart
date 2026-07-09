import { Product, ProductCard } from "@/components/shared/ProductCard";
import { SectionHeader } from "@website/shared/ui";
import { Gamepad2, Headphones, Monitor, Mouse } from "lucide-react";

const BEST: Product[] = [
  {
    id: "5",
    name: "Quasar Wireless Headset",
    category: "Audio",
    price: 149,
    rating: 4.5,
    icon: Headphones,
  },
  {
    id: "6",
    name: "Precision Gaming Mouse",
    category: "Accessories",
    price: 59,
    rating: 4.4,
    icon: Mouse,
  },
  {
    id: "7",
    name: 'UltraView OLED 27"',
    category: "Monitors",
    price: 549,
    rating: 4.7,
    icon: Monitor,
  },
  {
    id: "8",
    name: "Arcade Control Stick",
    category: "Gaming Gear",
    price: 89,
    rating: 4.6,
    icon: Gamepad2,
  },
];

const BestSellerSection = () => {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8'>
      <SectionHeader eyebrow={["Popular"]} title='Best sellers' accent='green' />
      <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {BEST.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
};

export default BestSellerSection;
