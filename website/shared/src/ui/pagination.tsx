import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "./cn";
import { buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role='navigation'
      aria-label='pagination'
      data-slot='pagination'
      className={cn("flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot='pagination-content'
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot='pagination-item' {...props} />;
}

// Explicit prop list rather than ComponentProps<"a" | "button">: the element
// swaps at runtime, so a shared DOM-prop type would need casts at both branches.
type PaginationLinkProps = {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  isActive?: boolean;
  disabled?: boolean;
  size?: "sm" | "default" | "icon" | "icon-sm";
  onClick?: React.MouseEventHandler<HTMLElement>;
  "aria-label"?: string;
};

// ponytail: renders an <a> when it has an href (storefront listing pages) and a
// <button> otherwise (admin tables paginate via onClick, and <a> can't be disabled).
function PaginationLink({
  className,
  isActive,
  disabled,
  size = "icon-sm",
  href,
  ...props
}: PaginationLinkProps) {
  const classes = cn(
    buttonVariants({
      variant: isActive ? "outline" : "ghost",
      size,
    }),
    "font-medium text-foreground/70 hover:text-foreground",
    isActive && "border-primary bg-primary/10 text-primary hover:text-primary",
    disabled && "pointer-events-none opacity-50",
    className,
  );

  const shared = {
    "aria-current": isActive ? ("page" as const) : undefined,
    "data-slot": "pagination-link",
    "data-active": isActive,
    className: classes,
  };

  if (href) {
    return (
      <a
        href={href}
        aria-disabled={disabled || undefined}
        {...shared}
        {...props}
      />
    );
  }

  return <button type='button' disabled={disabled} {...shared} {...props} />;
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label='Go to previous page'
      size='sm'
      className={cn("gap-1 pl-2", className)}
      {...props}
    >
      <ChevronLeft strokeWidth={1.5} />
      <span className='hidden sm:block'>Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label='Go to next page'
      size='sm'
      className={cn("gap-1 pr-2", className)}
      {...props}
    >
      <span className='hidden sm:block'>Next</span>
      <ChevronRight strokeWidth={1.5} />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot='pagination-ellipsis'
      className={cn(
        "flex size-8 items-center justify-center text-muted-foreground",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className='size-4' />
      <span className='sr-only'>More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
