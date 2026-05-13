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
import {
  signupPasswordSchema,
  signupSchema,
  type SignupFormValues,
} from '@/lib/auth/schemas';
import { useAuthStore } from '@/stores/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export default function SignUpPage() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const status = useAuthStore((state) => state.status);
  const [formError, setFormError] = useState<string | null>(null);
  const isLoading = status === 'loading';
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const password = useWatch({ control: form.control, name: 'password' });
  const passwordIsStrong = signupPasswordSchema.safeParse(password).success;

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);

    try {
      const parsed = signupSchema.parse(values);
      await signup({ email: parsed.email, password: parsed.password });
      router.push('/profile');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Signup failed.');
    }
  };

  return (
    <div className='grid min-h-screen place-items-center retro-grid scanlines px-4 py-10'>
      <div className='w-full max-w-md'>
        <Link href='/' className='mb-6 flex items-center justify-center gap-2'>
          <span className='grid h-10 w-10 place-items-center bg-neon-pink pixel-border'>
            <Gamepad2 className='h-5 w-5 text-background' />
          </span>
          <span className='font-pixel text-sm text-neon-pink glow-pink'>
            PIXELMART
          </span>
        </Link>
        <div className='pixel-border-pink bg-card p-8'>
          <div className='text-center'>
            <div className='font-pixel text-[9px] text-neon-cyan'>
              NEW PLAYER
            </div>
            <h1 className='mt-2 font-pixel text-xl'>CREATE ACCOUNT</h1>
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
                    autoComplete='new-password'
                    {...field}
                  />
                )}
              />
              <div>
                <div className='grid grid-cols-4 gap-1'>
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-2 border-2 border-foreground ${
                        passwordIsStrong || password.length > i * 2
                          ? 'bg-neon-green'
                          : 'bg-input'
                      }`}
                    />
                  ))}
                </div>
                <p className='mt-1 font-retro text-sm text-neon-green'>
                  Strength: {passwordIsStrong ? 'STRONG' : 'BUILDING'}
                </p>
              </div>
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <Field
                    label='CONFIRM PASSWORD'
                    type='password'
                    placeholder='********'
                    autoComplete='new-password'
                    {...field}
                  />
                )}
              />
              {formError && (
                <div className='border-[3px] border-destructive bg-destructive/10 p-3 font-retro text-base text-destructive'>
                  {formError}
                </div>
              )}
              <PixelButton
                variant='pink'
                className='w-full disabled:cursor-not-allowed disabled:opacity-60'
                disabled={isLoading}
              >
                {isLoading ? 'LOADING...' : '> CREATE ACCOUNT'}
              </PixelButton>
            </form>
          </Form>
          <div className='mt-6 text-center font-retro text-base text-muted-foreground'>
            Already a player?{' '}
            <Link href='/login' className='text-neon-cyan glow-cyan'>
              Login
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
      <FormLabel className='font-pixel text-[9px] text-neon-pink'>
        {label}
      </FormLabel>
      <FormControl>
        <input
          {...rest}
          className='mt-2 h-11 w-full border-[3px] border-foreground bg-input px-3 font-retro text-lg outline-none focus:border-neon-pink'
        />
      </FormControl>
      <FormMessage className='font-retro text-base' />
    </FormItem>
  );
}
