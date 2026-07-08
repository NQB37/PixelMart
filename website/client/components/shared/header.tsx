"use client";

import { Gamepad2, Menu, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@website/shared/ui";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useLogout";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className='sticky top-0 z-40 border-b-[3px] border-foreground bg-background/95 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center gap-4 px-4'>
        <Link href='/' className='flex items-center gap-2'>
          <span className='grid h-9 w-9 place-items-center bg-neon-cyan pixel-border'>
            <Gamepad2 className='h-5 w-5 text-background' />
          </span>
          <span className='font-pixel text-sm text-neon-cyan glow-cyan'>
            PIXEL<span className='text-neon-pink glow-pink'>MART</span>
          </span>
        </Link>

        <nav className='ml-6 hidden items-center gap-5 md:flex'>
          {NAV.map((n) => {
            const isActive = pathname === n.to;
            return (
              <Link
                key={n.label}
                href={n.to}
                className={
                  isActive
                    ? "font-pixel text-[10px] uppercase text-neon-cyan glow-cyan"
                    : "font-pixel text-[10px] uppercase tracking-wide text-foreground hover:text-neon-cyan"
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className='ml-auto hidden items-center gap-2 md:flex'>
          <div className='relative'>
            <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              placeholder='search gear...'
              className='h-10 w-56 border-[3px] border-foreground bg-input pl-8 pr-2 font-retro text-base text-foreground outline-none focus:border-neon-cyan'
            />
          </div>
          <Link
            href='/cart'
            className='relative grid h-10 w-10 place-items-center border-[3px] border-foreground bg-card hover:bg-neon-yellow hover:text-background'
            aria-label='Cart'
          >
            <ShoppingCart className='h-4 w-4' />
            <span className='absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center bg-neon-pink px-1 font-pixel text-[8px] text-background pixel-border'>
              3
            </span>
          </Link>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='flex h-10 items-center gap-2 border-[3px] border-foreground bg-card px-3 font-pixel text-[10px] uppercase hover:bg-neon-cyan hover:text-background'
                  aria-label='Open profile menu'
                  title={user?.email}
                >
                  <User className='h-4 w-4' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='min-w-36 rounded-none border-[3px] border-foreground bg-card p-1'
              >
                <DropdownMenuItem asChild>
                  <Link
                    href='/profile'
                    className='font-pixel text-[10px] uppercase focus:bg-neon-cyan focus:text-background'
                  >
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => logout()}
                  disabled={isPending}
                  className='font-pixel text-[10px] uppercase focus:bg-neon-pink focus:text-background'
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href='/login'
              className='flex h-10 items-center border-[3px] border-foreground bg-neon-green px-4 font-pixel text-[10px] uppercase text-background pixel-shadow hover:bg-neon-green/90'
              aria-label='Login'
            >
              Login
            </Link>
          )}
        </div>

        <button
          type='button'
          onClick={() => setOpen(!open)}
          className='ml-auto grid h-10 w-10 place-items-center border-[3px] border-foreground bg-card md:hidden'
          aria-label='Open menu'
        >
          <Menu className='h-4 w-4' />
        </button>
      </div>

      {open && (
        <div className='border-t-[3px] border-foreground bg-card md:hidden'>
          <nav className='flex flex-col p-4'>
            {NAV.map((n) => {
              const isActive = pathname === n.to;
              return (
                <Link
                  key={n.label}
                  href={n.to}
                  className={`py-2 font-pixel text-[10px] uppercase ${
                    isActive
                      ? "text-neon-cyan glow-cyan"
                      : "text-foreground hover:text-neon-cyan"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              href='/cart'
              className='py-2 font-pixel text-[10px] uppercase'
              onClick={() => setOpen(false)}
            >
              Cart
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href='/profile'
                  className='py-2 font-pixel text-[10px] uppercase'
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type='button'
                  className='py-2 text-left font-pixel text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-60'
                  onClick={() => logout()}
                  disabled={isPending}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href='/login'
                className='py-2 font-pixel text-[10px] uppercase'
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
