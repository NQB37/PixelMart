"use client";

import { Card, Button, Field, Form, FormField } from "@website/shared/ui";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupInput, signupSchema } from "../schemas/auth.schema";
import { useState } from "react";
import { useRegister } from "../hooks/useRegister";

const getPasswordStrength = (password: string): number => {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  return score;
};

const STRENGTH_COLORS = ["bg-primary/40", "bg-primary/60", "bg-primary/80", "bg-primary"];

const RegisterForm = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const { mutate: registerUser, isPending } = useRegister();

  const methods = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, control, watch } = methods;

  const password = watch("password") || "";
  const passwordStrength = getPasswordStrength(password);
  const passwordIsStrong = passwordStrength === 4;

  const onSubmit = async (values: SignupInput) => {
    setFormError(null);
    registerUser(values, {
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        setFormError(err?.response?.data?.message || "Register failed!");
      },
    });
  };

  return (
    <div className='grid min-h-screen place-items-center bg-secondary/20 px-4 py-10'>
      <div className='w-full max-w-md'>
        <Link href='/' className='mb-6 flex items-center justify-center gap-2'>
          <span className='grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground'>
            <ShoppingBag className='h-5 w-5' strokeWidth={1.5} />
          </span>
          <span className='font-display text-lg font-bold text-foreground'>
            Pixel<span className='text-primary'>Mart</span>
          </span>
        </Link>
        <Card className='p-8'>
          <div className='text-center'>
            <div className='text-xs font-semibold uppercase tracking-wide text-primary'>
              Create your account
            </div>
            <h1 className='mt-2 font-display text-2xl font-bold text-foreground'>
              Join PixelMart
            </h1>
          </div>
          <Form {...methods}>
            <form
              className='mt-6 space-y-4'
              onSubmit={handleSubmit(onSubmit)}
            >
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <Field
                    label='Email'
                    type='email'
                    placeholder='you@email.com'
                    autoComplete='email'
                    {...field}
                  />
                )}
              />
              <FormField
                control={control}
                name='password'
                render={({ field }) => (
                  <Field
                    label='Password'
                    type='password'
                    placeholder='••••••••'
                    autoComplete='new-password'
                    {...field}
                  />
                )}
              />
              <div>
                <div className='grid grid-cols-4 gap-1'>
                  {[0, 1, 2, 3].map((i) => {
                    const isActive = passwordStrength > i;
                    return (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full ${
                          isActive ? STRENGTH_COLORS[i] : "bg-muted"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Strength: {passwordIsStrong ? "Strong" : "Building"}
                </p>
              </div>
              <FormField
                control={control}
                name='confirmPassword'
                render={({ field }) => (
                  <Field
                    label='Confirm password'
                    type='password'
                    placeholder='••••••••'
                    autoComplete='new-password'
                    {...field}
                  />
                )}
              />
              {formError && (
                <div className='rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'>
                  {formError}
                </div>
              )}
              <Button
                variant='default'
                className='w-full disabled:cursor-not-allowed disabled:opacity-60'
                loading={isPending}
              >
                {isPending ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </Form>
          <div className='mt-6 text-center text-sm text-muted-foreground'>
            Already have an account?{" "}
            <Link href='/login' className='font-medium text-primary hover:underline'>
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;
