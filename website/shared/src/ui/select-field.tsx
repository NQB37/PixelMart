import * as React from "react";

import { cn } from "../utils/cn";
import { FieldError } from "./field";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface SelectFieldProps {
  label: string;
  // Anything with an id + name: brands, categories, vendors…
  options: { id: string; name: string }[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Labeled select whose option values are ids and whose labels are names.
// Controlled — pair it with react-hook-form's <Controller> in forms.
export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  disabled,
  className,
}: SelectFieldProps) {
  const id = React.useId();
  // `items` is what makes the trigger render the name for the selected id.
  const items = options.map((o) => ({ value: o.id, label: o.name }));

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Select
        items={items}
        value={value ?? null}
        onValueChange={(next) => onChange(next as string)}
        disabled={disabled}
      >
        <SelectTrigger id={id} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError>{error}</FieldError>
    </div>
  );
}
