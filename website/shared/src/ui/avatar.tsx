"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "./cn";

// shadcn/ui avatar (new-york-v4) + an `xl` size for profile headers.
// `AvatarBadge` is the presence dot; `AvatarGroup` stacks overlapping avatars.
function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "sm" | "default" | "lg" | "xl";
}) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      data-size={size}
      className={cn(
        "group/avatar relative flex size-9 shrink-0 rounded-full select-none data-[size=lg]:size-11 data-[size=sm]:size-7 data-[size=xl]:size-14",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold text-secondary-foreground group-data-[size=sm]/avatar:text-xs group-data-[size=xl]/avatar:text-lg",
        className,
      )}
      {...props}
    />
  );
}

const presenceTone = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
  offline: "bg-muted-foreground",
} as const;

function AvatarBadge({
  className,
  presence = "online",
  ...props
}: React.ComponentProps<"span"> & {
  presence?: keyof typeof presenceTone;
}) {
  return (
    <span
      data-slot='avatar-badge'
      data-presence={presence}
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 ring-background select-none",
        presenceTone[presence],
        "size-2.5 group-data-[size=lg]/avatar:size-3 group-data-[size=sm]/avatar:size-2 group-data-[size=xl]/avatar:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot='avatar-group'
      className={cn(
        "group/avatar-group flex -space-x-2.5 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot='avatar-group-count'
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-display text-xs font-semibold text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-11 group-has-data-[size=sm]/avatar-group:size-7 group-has-data-[size=xl]/avatar-group:size-14",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
};
