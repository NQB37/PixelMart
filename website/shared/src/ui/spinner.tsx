import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "./cn";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  label?: string;
}

function Spinner({ className, label = "Loading", ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label={label}
      className={cn("size-4 animate-spin text-primary", className)}
      {...props}
    />
  );
}

export { Spinner };
