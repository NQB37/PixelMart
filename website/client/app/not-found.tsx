import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { PixelButton } from "@website/shared/ui";

export default function NotFound() {
  return (
    <div className='grid min-h-screen place-items-center bg-secondary/20 px-4 py-16'>
      <div className='w-full max-w-md text-center'>
        <span className='mx-auto grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground'>
          <ShoppingBag className='h-6 w-6' strokeWidth={1.5} />
        </span>
        <div className='mt-6 font-display text-6xl font-extrabold text-primary'>
          404
        </div>
        <h1 className='mt-4 font-display text-xl font-bold text-foreground'>
          Page not found
        </h1>
        <p className='mx-auto mt-3 max-w-sm text-muted-foreground'>
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className='mt-8'>
          <Link href='/'>
            <PixelButton variant='cyan'>Back to home</PixelButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
