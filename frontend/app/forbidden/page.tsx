import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className='scanlines retro-grid flex min-h-screen items-center justify-center bg-background px-4 py-16'>
      <div className='border-2 border-foreground bg-background p-12 text-center max-w-[600px] w-full'>
        <div className='font-pixel text-[80px] text-destructive'>401</div>
        <div className='font-mono mt-6 text-2xl text-neon-pink'>
          ! ACCESS DENIED !
        </div>

        <h1 className='font-pixel mt-12 text-[11px] tracking-wider text-foreground uppercase'>
          PLAYER NOT AUTHENTICATED
        </h1>
        <p className='font-mono mt-5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed'>
          You must insert your credentials to enter this zone. Log in or sign up
          to continue your quest.
        </p>

        <div className='mt-10 flex flex-wrap justify-center gap-4'>
          <Link href='/login' className='btn-pixel'>
            LOG IN
          </Link>
          <Link href='/signup' className='btn-pixel btn-pixel-pink'>
            SIGN UP
          </Link>
          <Link href='/' className='btn-pixel btn-pixel-ghost'>
            HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
