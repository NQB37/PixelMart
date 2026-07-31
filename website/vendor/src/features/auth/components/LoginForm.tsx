import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Headset, Lock, Mail, ShieldCheck, Wallet } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
} from "@website/shared/ui";
import AuthShell from "./AuthShell";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";

const TRUST_POINTS = [
  { icon: ShieldCheck, text: "Bank-level encryption on every payout" },
  { icon: Wallet, text: "Get paid weekly, with no hidden fees" },
  { icon: Headset, text: "Real support from a real vendor success team" },
];

export default function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => login(data);

  return (
    <AuthShell
      heading='Welcome back, vendor.'
      description='Sign in to manage orders, inventory, and payouts.'
      trustPoints={TRUST_POINTS}
    >
      <div className='text-xs font-semibold uppercase tracking-wide text-primary'>
        Vendor portal
      </div>
      <h2 className='mt-2 font-display text-2xl font-bold text-foreground'>
        Sign in to your vendor account
      </h2>

      {error && (
        <Alert variant='destructive' className='mt-6'>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='vendor-login-email'>Email</Label>
          <div className='relative'>
            <Mail
              className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              id='vendor-login-email'
              type='email'
              className='pl-9'
              autoComplete='email'
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='vendor-login-password'>Password</Label>
          <div className='relative'>
            <Lock
              className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              id='vendor-login-password'
              type='password'
              className='pl-9'
              autoComplete='current-password'
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </div>
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button
          type='submit'
          variant='default'
          className='w-full'
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Spinner />
              <span className='ml-2'>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className='mt-6 text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{" "}
        <Link
          to='/register'
          className='font-medium text-primary hover:underline'
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
