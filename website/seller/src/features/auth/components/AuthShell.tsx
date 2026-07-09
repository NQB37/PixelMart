import type { ComponentType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { Stepper, type StepperStep } from "@website/shared/ui";

interface TrustPoint {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  text: string;
}

interface AuthShellProps {
  heading: string;
  description: string;
  steps?: StepperStep[];
  currentStepIndex?: number;
  trustPoints?: TrustPoint[];
  children: ReactNode;
}

// Split-panel shell shared by the seller auth + shop-registration pages: a
// mint-gradient brand panel (doubling as a step tracker during onboarding)
// alongside the actual form on a plain canvas.
export default function AuthShell({
  heading,
  description,
  steps,
  currentStepIndex = 0,
  trustPoints,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="bg-gradient-to-br from-primary via-emerald-400 to-teal-300 px-6 py-8 text-primary-foreground lg:flex lg:w-[38%] lg:flex-col lg:justify-between lg:px-10 lg:py-12">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground/15">
              <Store className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <span className="font-display text-base font-bold">
              PixelMart <span className="opacity-80">Seller</span>
            </span>
          </Link>

          <h1 className="mt-6 font-display text-2xl font-bold lg:mt-10 lg:text-3xl">
            {heading}
          </h1>
          <p className="mt-2 max-w-sm text-sm opacity-90">{description}</p>

          {steps && (
            <>
              <Stepper
                steps={steps}
                currentIndex={currentStepIndex}
                orientation="horizontal"
                className="mt-6 lg:hidden"
              />
              <Stepper
                steps={steps}
                currentIndex={currentStepIndex}
                orientation="vertical"
                className="mt-10 hidden lg:block"
              />
            </>
          )}
        </div>

        {trustPoints && (
          <ul className="mt-8 space-y-3 lg:mt-0">
            {trustPoints.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span className="opacity-90">{text}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
