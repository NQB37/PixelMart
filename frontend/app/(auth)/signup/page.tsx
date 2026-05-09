import { PixelButton } from '@/components/shared/PixelButton';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className='grid min-h-screen place-items-center retro-grid scanlines px-4 py-10'>
      <div className='w-full max-w-md'>
        <Link href='/' className='mb-6 flex items-center justify-center gap-2'>
          <span className='grid h-10 w-10 place-items-center bg-neon-pink pixel-border'>
            <Gamepad2 className='h-5 w-5 text-background' />
          </span>
          <span className='font-pixel text-sm text-neon-pink glow-pink'>
            PIXELMART
          </span>
        </Link>
        <div className='pixel-border-pink bg-card p-8'>
          <div className='text-center'>
            <div className='font-pixel text-[9px] text-neon-cyan'>
              ▶ NEW PLAYER
            </div>
            <h1 className='mt-2 font-pixel text-xl'>CREATE ACCOUNT</h1>
          </div>
          <form className='mt-6 space-y-4'>
            <Field label='NAME' placeholder='Player One' />
            <Field label='EMAIL' type='email' placeholder='player1@email.com' />
            <Field label='PASSWORD' type='password' placeholder='••••••••' />
            <div>
              <div className='grid grid-cols-4 gap-1'>
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-2 border-2 border-foreground ${i < 3 ? 'bg-neon-green' : 'bg-input'}`}
                  />
                ))}
              </div>
              <p className='mt-1 font-retro text-sm text-neon-green'>
                Strength: STRONG
              </p>
            </div>
            <Field
              label='CONFIRM PASSWORD'
              type='password'
              placeholder='••••••••'
            />
            <label className='flex items-start gap-2 font-retro text-base'>
              <span className='mt-1 grid h-4 w-4 place-items-center border-2 border-foreground bg-input' />
              I agree to the terms and privacy policy
            </label>
            <PixelButton variant='pink' className='w-full'>
              ► CREATE ACCOUNT
            </PixelButton>
          </form>
          <div className='mt-6 text-center font-retro text-base text-muted-foreground'>
            Already a player?{' '}
            <Link href='/login' className='text-neon-cyan glow-cyan'>
              Login
            </Link>
          </div>
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
      <span className='font-pixel text-[9px] text-neon-pink'>{label}</span>
      <input
        {...rest}
        className='mt-2 h-11 w-full border-[3px] border-foreground bg-input px-3 font-retro text-lg outline-none focus:border-neon-pink'
      />
    </label>
  );
}
