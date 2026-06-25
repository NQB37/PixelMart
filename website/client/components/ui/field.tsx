import { FormControl, FormItem, FormLabel, FormMessage } from "./form";

export function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormItem>
      <FormLabel className='font-pixel text-[9px] text-neon-cyan'>
        {label}
      </FormLabel>
      <FormControl>
        <input
          {...rest}
          className='mt-2 h-11 w-full border-[3px] border-foreground bg-input px-3 font-retro text-lg outline-none focus:border-neon-cyan'
        />
      </FormControl>
      <FormMessage className='font-retro text-base' />
    </FormItem>
  );
}
