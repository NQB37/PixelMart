"use client";

import { PixelButton, Field, Form, FormField } from "@pixelmart/shared/ui";
import { Gamepad2 } from "lucide-react";
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
                    label='EMAIL'
                    type='email'
                    placeholder='player1@email.com'
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
                  {[0, 1, 2, 3].map((i) => {
                    const isActive = passwordStrength > i;
                    const activeColors = [
                      "bg-[#14532d]",
                      "bg-[#15803d]",
                      "bg-[#22c55e]",
                      "bg-neon-green",
                    ];
                    return (
                      <span
                        key={i}
                        className={`h-2 border-2 border-foreground ${
                          isActive ? activeColors[i] : "bg-input"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className='mt-1 font-retro text-sm text-neon-green'>
                  Strength: {passwordIsStrong ? "STRONG" : "BUILDING"}
                </p>
              </div>
              <FormField
                control={control}
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
                disabled={isPending}
              >
                {isPending ? "LOADING..." : "> CREATE ACCOUNT"}
              </PixelButton>
            </form>
          </Form>
          <div className='mt-6 text-center font-retro text-base text-muted-foreground'>
            Already a player?{" "}
            <Link href='/login' className='text-neon-cyan glow-cyan'>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
