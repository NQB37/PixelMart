import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Headset, Lock, Mail, ShieldCheck, Wallet } from "lucide-react";
import { Alert, AlertDescription, PixelButton, TextField } from "@website/shared/ui";
import AuthShell from "./AuthShell";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";

const TRUST_POINTS = [
  { icon: ShieldCheck, text: "Bank-level encryption on every payout" },
  { icon: Wallet, text: "Get paid weekly, with no hidden fees" },
  { icon: Headset, text: "Real support from a real seller success team" },
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
      heading="Welcome back, seller."
      description="Sign in to manage orders, inventory, and payouts."
      trustPoints={TRUST_POINTS}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">
        Seller portal
      </div>
      <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
        Sign in to your shop
      </h2>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <TextField
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PixelButton variant="cyan" className="w-full" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </PixelButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
