import { PixelButton } from '@/components/shared/PixelButton';
import { CreditCard, Truck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage() {
  const methods = [
    { i: CreditCard, t: 'CARD' },
    { i: Truck, t: 'COD' },
  ];
  return (
    <div className='mx-auto max-w-3xl px-4 py-10'>
      <div className='font-pixel text-[10px] text-neon-pink glow-pink'>
        ▶ STEP 3 OF 3
      </div>
      <h1 className='mt-2 font-pixel text-2xl'>PAYMENT</h1>

      <div className='mt-8 border-[3px] border-foreground bg-card p-6 pixel-shadow'>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
          {methods.map(({ i: Icon, t }, idx) => (
            <button
              key={t}
              className={`flex flex-col items-center gap-2 border-[3px] p-4 ${idx === 0 ? 'border-neon-cyan bg-neon-cyan/10' : 'border-foreground bg-background'}`}
            >
              <Icon className='h-5 w-5' />
              <span className='font-pixel text-[9px]'>{t}</span>
            </button>
          ))}
        </div>

        <div className='mt-6 grid gap-4'>
          <Field label='CARDHOLDER' placeholder='PLAYER ONE' />
          <Field label='CARD NUMBER' placeholder='1234 5678 9012 3456' />
          <div className='grid grid-cols-2 gap-4'>
            <Field label='EXPIRY' placeholder='MM/YY' />
            <Field label='CVV' placeholder='•••' />
          </div>
          <label className='flex items-center gap-2 font-retro text-base'>
            <span className='grid h-4 w-4 place-items-center border-2 border-foreground bg-input' />
            Billing same as shipping
          </label>
        </div>

        <div className='mt-6 flex items-center gap-2 border-[3px] border-neon-green bg-neon-green/10 p-3 font-retro text-base'>
          <Lock className='h-4 w-4 text-neon-green' /> Encrypted with 256-bit
          SSL — your data is safe.
        </div>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/checkout'>
            <PixelButton variant='ghost'>← BACK</PixelButton>
          </Link>
          <PixelButton variant='green'>► CONFIRM PAYMENT · $2,150</PixelButton>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className='block'>
      <span className='font-pixel text-[9px] text-neon-cyan'>{label}</span>
      <input
        {...rest}
        className='mt-2 h-11 w-full border-[3px] border-foreground bg-input px-3 font-retro text-lg outline-none focus:border-neon-cyan'
      />
    </label>
  );
}
