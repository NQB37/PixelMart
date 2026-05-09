import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='scanlines retro-grid flex min-h-screen items-center justify-center bg-background px-4 py-16'>
      <div className='border-2 border-foreground bg-background p-12 text-center max-w-[600px] w-full'>
        <div className='font-pixel text-[80px] text-neon-cyan'>404</div>
        <div className='font-mono mt-6 text-2xl text-neon-pink'>
          ! GAME OVER !
        </div>

        <h1 className='font-pixel mt-12 text-[11px] tracking-wider text-foreground uppercase'>
          PAGE NOT FOUND
        </h1>
        <p className='font-mono mt-5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed'>
          The level you&apos;re looking for has been deleted from the cartridge.
        </p>

        <div className='mt-10 flex flex-wrap justify-center'>
          <Link href='/' className='btn-pixel'>
            RETURN TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
