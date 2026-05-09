import { Gamepad2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className='mt-24 border-t-[3px] border-foreground bg-sidebar'>
      <div className='mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='grid h-8 w-8 place-items-center bg-neon-cyan pixel-border'>
              <Gamepad2 className='h-4 w-4 text-background' />
            </span>
            <span className='font-pixel text-xs text-neon-cyan'>PIXELMART</span>
          </div>
          <p className='mt-3 font-retro text-base text-muted-foreground'>
            Retro vibes. Modern tech. Press start to upgrade your loadout.
          </p>
        </div>
        <div>
          <h4 className='font-pixel text-[10px] text-neon-pink'>SHOP</h4>
          <ul className='mt-3 space-y-2 font-retro text-base text-muted-foreground'>
            <li>Smartphones</li>
            <li>Laptops</li>
            <li>Gaming PCs</li>
            <li>Accessories</li>
          </ul>
        </div>
      </div>
      <div className='border-t-[3px] border-foreground py-4 text-center font-pixel text-[8px] text-muted-foreground'>
        © {new Date().getFullYear()} PIXELMART — INSERT COIN TO CONTINUE{' '}
        <span className='blink text-neon-cyan'>▮</span>
      </div>
    </footer>
  );
}
