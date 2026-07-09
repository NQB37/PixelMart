"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = isClient && resolvedTheme === "dark";

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className='grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent'
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Moon className='h-4 w-4' strokeWidth={1.5} />
      ) : (
        <Sun className='h-4 w-4' strokeWidth={1.5} />
      )}
    </button>
  );
};

export default ThemeToggle;
