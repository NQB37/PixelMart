import { cn } from "./cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "cyan" | "pink" | "green" | "yellow" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-display text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

// Variant names preserved for API compatibility; mapped to mint-system roles.
const variantClass: Record<Variant, string> = {
  cyan: "bg-primary text-primary-foreground hover:bg-primary/90",
  pink: "bg-highlight text-highlight-foreground hover:bg-highlight/90",
  green: "bg-success text-white hover:bg-success/90",
  yellow: "bg-warning text-foreground hover:bg-warning/90",
  ghost: "bg-transparent text-primary hover:bg-accent",
};

export const PixelButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "cyan", className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantClass[variant], className)}
      {...rest}
    />
  ),
);
PixelButton.displayName = "PixelButton";
