import { Product, ProductCard } from "@/components/shared/ProductCard";
import SectionHeader from "@/components/ui/sectionHeader";

const BestSellerSection = () => {
  const BEST: Product[] = [
    {
      id: "5",
      name: "QUASAR HEADSET 7.1",
      category: "Audio",
      price: 149,
      rating: 4.5,
      emoji: "🎧",
      accent: "cyan",
    },
    {
      id: "6",
      name: "RGB GAMING MOUSE",
      category: "Accessories",
      price: 59,
      rating: 4.4,
      emoji: "🖱️",
      accent: "pink",
    },
    {
      id: "7",
      name: 'ULTRA OLED 27"',
      category: "Monitors",
      price: 549,
      rating: 4.7,
      emoji: "📺",
      accent: "green",
    },
    {
      id: "8",
      name: "RETRO ARCADE STICK",
      category: "Gaming Gear",
      price: 89,
      rating: 4.6,
      emoji: "🕹️",
      accent: "yellow",
    },
  ];
  return (
    <section className='mx-auto max-w-7xl px-4 py-16'>
      <SectionHeader
        eyebrow={["★", "POPULAR"]}
        title='BEST SELLERS'
        accent='green'
      />
      <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {BEST.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
};

export default BestSellerSection;
