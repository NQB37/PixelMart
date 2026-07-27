import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./cn";
import { Spinner } from "./spinner";

// Sizes are padding-based rather than fixed-height so a call site can still
// override padding through className. Icon sizes are square: 16px icon + padding.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-display text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent text-primary hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
        highlight:
          "bg-highlight text-highlight-foreground hover:bg-highlight/90",
        success: "bg-success text-white hover:bg-success/90",
        warning: "bg-warning text-foreground hover:bg-warning/90",
      },
      size: {
        default: "px-5 py-2.5",
        sm: "gap-1.5 px-3.5 py-1.5 text-xs",
        lg: "px-7 py-3 text-base",
        icon: "p-3",
        "icon-sm": "p-1.5",
        "icon-lg": "p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className='text-current' />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
