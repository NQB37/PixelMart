"use client";

import { Menu, Search, ShoppingBag, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@website/shared/ui";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import ThemeToggle from "./theme-toggle";

const Header = () => {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6 lg:px-8'>
        <Link href='/' className='flex shrink-0 items-center gap-2'>
          <span className='grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground'>
            <ShoppingBag className='h-5 w-5' strokeWidth={1.5} />
          </span>
          <span className='font-display text-lg font-bold text-foreground'>
            Pixel<span className='text-primary'>Mart</span>
          </span>
        </Link>

        <div className='relative mx-auto min-w-0 max-w-2xl flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input placeholder='Search products…' className='w-full pl-9' />
        </div>

        <div className='hidden shrink-0 items-center gap-3 md:flex'>
          <ThemeToggle />
          <Link
            href='/cart'
            className='relative grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent'
            aria-label='Cart'
          >
            <ShoppingCart className='h-4 w-4' strokeWidth={1.5} />
            <span className='absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground'>
              3
            </span>
          </Link>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type='button'
                    className='grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent'
                    aria-label='Open profile menu'
                    title={user?.email}
                  >
                    <User className='h-4 w-4' strokeWidth={1.5} />
                  </button>
                }
              />
              <DropdownMenuContent align='end' className='min-w-36'>
                <DropdownMenuItem render={<Link href='/profile'>Profile</Link>} />
                <DropdownMenuItem onSelect={() => logout()} disabled={isPending}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href='/login'
              className='inline-flex h-10 items-center rounded-md bg-primary px-4 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
              aria-label='Login'
            >
              Login
            </Link>
          )}
        </div>

        <div className='flex shrink-0 items-center gap-2 md:hidden'>
          <ThemeToggle />
          <button
            type='button'
            onClick={() => setOpen(!open)}
            className='grid h-10 w-10 place-items-center rounded-md text-foreground hover:bg-accent'
            aria-label='Open menu'
          >
            <Menu className='h-5 w-5' />
          </button>
        </div>
      </div>

      {open && (
        <div className='border-t border-border bg-background md:hidden'>
          <nav className='flex flex-col p-4'>
            <Link
              href='/cart'
              className='py-2 font-display text-sm text-foreground/70 hover:text-primary'
              onClick={() => setOpen(false)}
            >
              Cart
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href='/profile'
                  className='py-2 font-display text-sm text-foreground/70 hover:text-primary'
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type='button'
                  className='py-2 text-left font-display text-sm text-foreground/70 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60'
                  onClick={() => logout()}
                  disabled={isPending}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href='/login'
                className='py-2 font-display text-sm font-semibold text-primary'
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
