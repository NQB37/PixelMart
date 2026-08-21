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
import { useRegister } from "../hooks/useRegister";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";

const TRUST_POINTS = [
  { icon: ShieldCheck, text: "Free to join, no setup fees" },
  { icon: Wallet, text: "Weekly payouts straight to your bank" },
  { icon: Headset, text: "Guided onboarding with real human support" },
];

export default function RegisterForm() {
  const { mutate: registerUser, isPending, error } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => registerUser(data);

  return (
    <AuthShell
      heading='Start selling in minutes.'
      description='Join thousands of vendors already growing their business on PixelMart.'
      trustPoints={TRUST_POINTS}
    >
      <div className='text-xs font-semibold uppercase tracking-wide text-primary'>
        Vendor portal
      </div>
      <h2 className='mt-2 font-display text-2xl font-bold text-foreground'>
        Create your vendor account
      </h2>

      {error && (
        <Alert variant='destructive' className='mt-6'>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='vendor-register-email'>Email</Label>
          <div className='relative'>
            <Mail
              className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              id='vendor-register-email'
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
          <Label htmlFor='vendor-register-password'>Password</Label>
          <div className='relative'>
            <Lock
              className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              id='vendor-register-password'
              type='password'
              className='pl-9'
              autoComplete='new-password'
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </div>
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='vendor-register-confirm-password'>
            Confirm password
          </Label>
          <div className='relative'>
            <Lock
              className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              id='vendor-register-confirm-password'
              type='password'
              className='pl-9'
              autoComplete='new-password'
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </div>
          <FieldError>{errors.confirmPassword?.message}</FieldError>
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
              <span className='ml-2'>Creating account…</span>
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className='mt-6 text-center text-sm text-muted-foreground'>
        Already have an account?{" "}
        <Link to='/login' className='font-medium text-primary hover:underline'>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
