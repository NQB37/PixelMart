'use client';

import { PixelButton } from '@/components/shared/PixelButton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { loginSchema, type LoginFormValues } from '@/lib/auth/schemas';
import { useAuthStore } from '@/stores/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const [formError, setFormError] = useState<string | null>(null);
  const isLoading = status === 'loading';
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      const parsed = loginSchema.parse(values);
      await login(parsed);
      router.push('/profile');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login failed.');
    }
  };

  return (
    <div className='grid min-h-screen place-items-center retro-grid scanlines px-4 py-10'>
      <div className='w-full max-w-md'>
        <Link href='/' className='mb-6 flex items-center justify-center gap-2'>
          <span className='grid h-10 w-10 place-items-center bg-neon-cyan pixel-border'>
            <Gamepad2 className='h-5 w-5 text-background' />
          </span>
          <span className='font-pixel text-sm text-neon-cyan glow-cyan'>
            PIXELMART
          </span>
        </Link>
        <div className='pixel-border-cyan bg-card p-8'>
          <div className='text-center'>
            <div className='font-pixel text-[9px] text-neon-pink'>
              PLAYER LOGIN
            </div>
            <h1 className='mt-2 font-pixel text-xl'>PRESS START</h1>
          </div>
          <Form {...form}>
            <form
              className='mt-6 space-y-4'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <Field
                    label='EMAIL'
                    type='email'
                    placeholder='player1@email.com'
                    autoComplete='email'
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <Field
                    label='PASSWORD'
                    type='password'
                    placeholder='********'
                    autoComplete='current-password'
                    {...field}
                  />
                )}
              />
              <div className='flex items-center justify-between font-retro text-base'>
                <label className='flex items-center gap-2'>
                  <span className='grid h-4 w-4 place-items-center border-2 border-foreground bg-input' />
                  Remember me
                </label>
                <a className='text-neon-cyan hover:glow-cyan'>Forgot?</a>
              </div>
              {formError && (
                <div className='border-[3px] border-destructive bg-destructive/10 p-3 font-retro text-base text-destructive'>
                  {formError}
                </div>
              )}
              <PixelButton
                variant='cyan'
                className='w-full disabled:cursor-not-allowed disabled:opacity-60'
                disabled={isLoading}
              >
                {isLoading ? 'LOADING...' : '> LOGIN'}
              </PixelButton>
              <button
                type='button'
                className='w-full border-[3px] border-foreground bg-card px-4 py-3 font-pixel text-[10px] hover:bg-neon-yellow hover:text-background'
              >
                CONTINUE WITH GOOGLE
              </button>
            </form>
          </Form>
          <div className='mt-6 text-center font-retro text-base text-muted-foreground'>
            New player?{' '}
            <Link href='/signup' className='text-neon-pink glow-pink'>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
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
