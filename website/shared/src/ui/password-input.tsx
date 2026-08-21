import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "../utils/cn";
import { Input } from "./input";

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className='relative'>
      <Input
        type={isVisible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type='button'
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
      >
        {isVisible ? (
          <EyeOff className='h-4 w-4' strokeWidth={1.5} />
        ) : (
          <Eye className='h-4 w-4' strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
