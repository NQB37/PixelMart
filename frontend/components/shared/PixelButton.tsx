import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'cyan' | 'pink' | 'green' | 'yellow' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  cyan: 'btn-pixel',
  pink: 'btn-pixel btn-pixel-pink',
  green: 'btn-pixel btn-pixel-green',
  yellow: 'btn-pixel btn-pixel-yellow',
  ghost: 'btn-pixel btn-pixel-ghost',
};

export const PixelButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'cyan', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(variantClass[variant], className)}
      {...rest}
    />
  ),
);
PixelButton.displayName = 'PixelButton';
