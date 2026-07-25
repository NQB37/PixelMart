import { cn } from "./cn";
import { FormControl, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";

// Inline validation message for hand-rolled fields (plain `register()` usage,
// no Form context). Renders nothing when there is no message.
export function FieldError({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn(
        "mt-1.5 flex items-start gap-1 text-xs font-medium text-destructive",
        className,
      )}
    >
      <span aria-hidden="true" className="leading-none">
        *
      </span>
      <span>{children}</span>
    </p>
  );
}

export function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input {...rest} value={rest.value ?? ""} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
