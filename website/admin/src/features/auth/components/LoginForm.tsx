import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
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
  { icon: ShieldCheck, text: "Full audit trail on every action" },
  { icon: KeyRound, text: "Role-based access control across the platform" },
  { icon: Activity, text: "Real-time visibility into orders and vendors" },
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
      heading='Admin control, made simple.'
      description='Sign in to manage users, catalog, and platform settings.'
      trustPoints={TRUST_POINTS}
    >
      <div className='text-xs font-semibold uppercase tracking-wide text-primary'>
        Admin console
      </div>
      <h2 className='mt-2 font-display text-2xl font-bold text-foreground'>
        Sign in to the control panel
      </h2>

      {error && (
        <Alert variant='destructive' className='mt-6'>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='admin-login-email'>Email</Label>
          <div className='relative'>
            <Mail
              className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              id='admin-login-email'
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
          <Label htmlFor='admin-login-password'>Password</Label>
          <div className='relative'>
            <Lock
              className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              id='admin-login-password'
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
          {isPending && <Spinner />}
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
