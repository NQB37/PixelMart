import { FormControl, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";

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
