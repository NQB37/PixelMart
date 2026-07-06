import { Product, ProductCard } from "@/components/shared/ProductCard";
import SectionHeader from "@/components/ui/sectionHeader";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const DealSection = () => {
  const DEALS: Product[] = [
    {
      id: "1",
      name: "ARCADE-X PRO PHONE",
      category: "Smartphones",
      price: 699,
      oldPrice: 899,
      rating: 4.6,
      badge: "HOT",
      emoji: "📱",
      accent: "pink",
    },
    {
      id: "2",
      name: "PIXEL BLADE LAPTOP 16",
      category: "Laptops",
      price: 1299,
      oldPrice: 1599,
      rating: 4.8,
      badge: "SALE",
      emoji: "💻",
      accent: "cyan",
    },
    {
      id: "3",
      name: "NEON RIG TOWER RTX",
      category: "Gaming PCs",
      price: 1899,
      oldPrice: 2299,
      rating: 4.9,
      emoji: "🖥️",
      accent: "green",
    },
    {
      id: "4",
      name: "8-BIT MECH KEYBOARD",
      category: "Accessories",
      price: 119,
      oldPrice: 159,
      rating: 4.7,
      badge: "NEW",
      emoji: "⌨️",
      accent: "yellow",
    },
  ];

  return (
    <section className='border-y-[3px] border-foreground bg-sidebar py-16'>
      <div className='mx-auto max-w-7xl px-4'>
        <div className='flex items-end justify-between'>
          <SectionHeader
            eyebrow={["🔥", "HOT DEALS"]}
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
  );
};

export default DealSection;
