import { PixelButton } from '@/components/shared/PixelButton';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className='grid min-h-screen place-items-center retro-grid scanlines px-4 py-10'>
      <div className='w-full max-w-md'>
        <Link href='/' className='mb-6 flex items-center justify-center gap-2'>
          <span className='grid h-10 w-10 place-items-center bg-neon-cyan pixel-border'>
            <Gamepad2 className='h-5 w-5 text-background' />
          </span>
          <span className='font-pixel text-sm text-neon-cyan glow-cyan'>
            PIXELMART
          </span>
        </Link>
        <div className='pixel-border-cyan bg-card p-8'>
          <div className='text-center'>
            <div className='font-pixel text-[9px] text-neon-pink'>
              ▶ PLAYER LOGIN
            </div>
            <h1 className='mt-2 font-pixel text-xl'>PRESS START</h1>
          </div>
          <form className='mt-6 space-y-4'>
            <Field label='EMAIL' type='email' placeholder='player1@email.com' />
            <Field label='PASSWORD' type='password' placeholder='••••••••' />
            <div className='flex items-center justify-between font-retro text-base'>
              <label className='flex items-center gap-2'>
                <span className='grid h-4 w-4 place-items-center border-2 border-foreground bg-input' />
                Remember me
              </label>
              <a className='text-neon-cyan hover:glow-cyan'>Forgot?</a>
            </div>
            <PixelButton variant='cyan' className='w-full'>
              ► LOGIN
            </PixelButton>
            <button
              type='button'
              className='w-full border-[3px] border-foreground bg-card px-4 py-3 font-pixel text-[10px] hover:bg-neon-yellow hover:text-background'
            >
              CONTINUE WITH GOOGLE
            </button>
          </form>
          <div className='mt-6 text-center font-retro text-base text-muted-foreground'>
            New player?{' '}
            <Link href='/signup' className='text-neon-pink glow-pink'>
              Sign up
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
      <span className='font-pixel text-[9px] text-neon-cyan'>{label}</span>
      <input
        {...rest}
        className='mt-2 h-11 w-full border-[3px] border-foreground bg-input px-3 font-retro text-lg outline-none focus:border-neon-cyan'
      />
    </label>
  );
}
