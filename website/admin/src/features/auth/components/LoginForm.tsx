import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, PixelButton, TextField } from "@website/shared/ui";
import AuthShell from "./AuthShell";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";

const TRUST_POINTS = [
  { icon: ShieldCheck, text: "Full audit trail on every action" },
  { icon: KeyRound, text: "Role-based access control across the platform" },
  { icon: Activity, text: "Real-time visibility into orders and sellers" },
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
      heading="Admin control, made simple."
      description="Sign in to manage users, catalog, and platform settings."
      trustPoints={TRUST_POINTS}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">
        Admin console
      </div>
      <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
        Sign in to the control panel
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
    </AuthShell>
  );
}
