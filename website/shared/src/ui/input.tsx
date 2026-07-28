import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "../utils/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot='input'
      className={cn(
        "flex h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
