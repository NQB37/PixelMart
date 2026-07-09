import { ShoppingBag } from "lucide-react";

const Footer = () => {
  return (
    <footer className='mt-24 border-t border-border bg-secondary/40'>
      <div className='mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-6 lg:px-8'>
        <div className='col-span-2 md:col-span-1'>
          <div className='flex items-center gap-2'>
            <span className='grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground'>
              <ShoppingBag className='h-4 w-4' strokeWidth={1.5} />
            </span>
            <span className='font-display text-base font-bold text-foreground'>
              Pixel<span className='text-primary'>Mart</span>
            </span>
          </div>
          <p className='mt-3 text-sm text-muted-foreground'>
            Everyday tech, picked for performance and priced to make sense.
          </p>
        </div>
        <div>
          <h4 className='font-display text-sm font-semibold text-foreground'>
            Shop
          </h4>
          <ul className='mt-3 space-y-2 text-sm text-muted-foreground'>
            <li>Smartphones</li>
            <li>Laptops</li>
            <li>Gaming PCs</li>
            <li>Accessories</li>
          </ul>
        </div>
      </div>
      <div className='border-t border-border py-4 text-center text-xs text-muted-foreground'>
        © {new Date().getFullYear()} PixelMart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
