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
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import ThemeToggle from "./theme-toggle";

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
    <header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2'>
          <span className='grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground'>
            <ShoppingBag className='h-5 w-5' strokeWidth={1.5} />
          </span>
          <span className='font-display text-lg font-bold text-foreground'>
            Pixel<span className='text-primary'>Mart</span>
          </span>
        </Link>

        <nav className='ml-6 hidden items-center gap-6 md:flex'>
          {NAV.map((n) => {
            const isActive = pathname === n.to;
            return (
              <Link
                key={n.label}
                href={n.to}
                className={
                  isActive
                    ? "font-display text-sm font-semibold text-primary"
                    : "font-display text-sm font-medium text-foreground/70 hover:text-primary"
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className='ml-auto hidden items-center gap-3 md:flex'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input placeholder='Search products…' className='w-56 pl-9' />
          </div>
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
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent'
                  aria-label='Open profile menu'
                  title={user?.email}
                >
                  <User className='h-4 w-4' strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-36'>
                <DropdownMenuItem asChild>
                  <Link href='/profile'>Profile</Link>
                </DropdownMenuItem>
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

        <div className='ml-auto flex items-center gap-2 md:hidden'>
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
            {NAV.map((n) => {
              const isActive = pathname === n.to;
              return (
                <Link
                  key={n.label}
                  href={n.to}
                  className={`py-2 font-display text-sm ${
                    isActive
                      ? "font-semibold text-primary"
                      : "text-foreground/70 hover:text-primary"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              );
            })}
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
