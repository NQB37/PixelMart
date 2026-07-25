import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Headset, Lock, Mail, ShieldCheck, Wallet } from "lucide-react";
import { Alert, AlertDescription, Button, TextField } from "@website/shared/ui";
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
      heading="Start selling in minutes."
      description="Join thousands of sellers already growing their shop on PixelMart."
      trustPoints={TRUST_POINTS}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">
        Seller portal
      </div>
      <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
        Create your seller account
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Confirm password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button variant="default" className="w-full" loading={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
