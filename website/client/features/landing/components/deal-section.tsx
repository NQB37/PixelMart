import { Product, ProductCard } from "@/components/shared/ProductCard";
import { SectionHeader } from "@website/shared/ui";
import { ChevronRight, Keyboard, Laptop, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";

const DEALS: Product[] = [
  {
    id: "1",
    name: "Pixel Phone 12 Pro",
    category: "Smartphones",
    price: 699,
    oldPrice: 899,
    rating: 4.6,
    icon: Smartphone,
  },
  {
    id: "2",
    name: "Nimbus Laptop 16",
    category: "Laptops",
    price: 1299,
    oldPrice: 1599,
    rating: 4.8,
    icon: Laptop,
  },
  {
    id: "3",
    name: "Vertex Gaming Tower",
    category: "Gaming PCs",
    price: 1899,
    oldPrice: 2299,
    rating: 4.9,
    icon: Monitor,
  },
  {
    id: "4",
    name: "AeroType Mechanical Keyboard",
    category: "Accessories",
    price: 119,
    oldPrice: 159,
    rating: 4.7,
    icon: Keyboard,
  },
];

const DealSection = () => {
  return (
    <section className='bg-secondary/30 py-16'>
      <div className='mx-auto max-w-7xl px-4 md:px-6 lg:px-8'>
        <div className='flex items-end justify-between'>
          <SectionHeader eyebrow={["Hot deals"]} title='Flash deals' accent='pink' />
          <Link
            href='/products'
            className='hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex'
          >
            See all <ChevronRight className='h-4 w-4' />
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
