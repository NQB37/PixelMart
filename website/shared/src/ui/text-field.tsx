import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../utils/cn";
import { Input } from "./input";
import { Label } from "./label";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

// Labeled input for plain react-hook-form `register()` usage (uncontrolled),
// as opposed to `Field`, which is bound to a `Form`/`FormField` Controller context.
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { label, icon: Icon, error, id, className, containerClassName, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <Label htmlFor={fieldId}>{label}</Label>
        <div className='relative'>
          {Icon && (
            <Icon
              className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
          )}
          <Input
            id={fieldId}
            ref={ref}
            className={cn(Icon && "pl-9", className)}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error && (
          <p className='text-sm font-medium text-destructive'>{error}</p>
        )}
      </div>
    );
  },
);
TextField.displayName = "TextField";
