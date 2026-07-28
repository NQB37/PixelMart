"use client";

import { LoginInput, loginSchema } from "../schemas/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Card, Button, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Input } from "@website/shared/ui";
import { useLogin } from "../hooks/useLogin";

const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (data: LoginInput) => {
    login(data);
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
              Welcome back
            </div>
            <h1 className='mt-2 font-display text-2xl font-bold text-foreground'>
              Log in to your account
            </h1>
          </div>
          <Form {...methods}>
            <form className='mt-6 space-y-4' onSubmit={handleSubmit(onSubmit)}>
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                      type='email'
                      placeholder='you@email.com'
                      autoComplete='email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                      type='password'
                      placeholder='••••••••'
                      autoComplete='current-password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex items-center justify-between text-sm'>
                <label className='flex items-center gap-2 text-muted-foreground'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 rounded border-input accent-primary'
                  />
                  Remember me
                </label>
                <a className='font-medium text-primary hover:underline'>
                  Forgot password?
                </a>
              </div>
              <Button
                variant='default'
                className='w-full disabled:cursor-not-allowed disabled:opacity-60'
                disabled={isPending}
              >
                {isPending ? "Logging in…" : "Log in"}
              </Button>
              <div className='flex items-center gap-3 text-xs font-medium text-muted-foreground'>
                <div className='h-px flex-1 bg-border' />
                OR
                <div className='h-px flex-1 bg-border' />
              </div>
              <button
                type='button'
                className='w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent'
              >
                Continue with Google
              </button>
            </form>
          </Form>
          <div className='mt-6 text-center text-sm text-muted-foreground'>
            New here?{" "}
            <Link href='/register' className='font-medium text-primary hover:underline'>
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
