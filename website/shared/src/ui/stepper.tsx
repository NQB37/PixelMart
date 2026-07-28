import { Check } from "lucide-react";

import { cn } from "../utils/cn";

export interface StepperStep {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentIndex: number;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

// Reads its color from the surrounding text color (`currentColor`) so it can
// sit on a tinted brand panel or a plain surface without a variant prop.
export function Stepper({
  steps,
  currentIndex,
  orientation = "vertical",
  className,
}: StepperProps) {
  if (orientation === "horizontal") {
    return (
      <div className={cn("w-full", className)}>
        <div className='flex items-center gap-1.5'>
          {steps.map((step, i) => (
            <span
              key={step.label}
              className={cn(
                "h-1.5 flex-1 rounded-full bg-current/25",
                i <= currentIndex && "bg-current",
              )}
            />
          ))}
        </div>
        <p className='mt-2 text-sm font-medium'>
          Step {currentIndex + 1} of {steps.length} ·{" "}
          {steps[currentIndex]?.label}
        </p>
      </div>
    );
  }

  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, i) => {
        const status =
          i < currentIndex
            ? "done"
            : i === currentIndex
              ? "current"
              : "upcoming";
        const isLast = i === steps.length - 1;
        return (
          <li key={step.label} className='flex gap-3'>
            <div className='flex flex-col items-center'>
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  status === "done" && "border-current bg-current/20",
                  status === "current" && "border-current bg-current",
                  status === "upcoming" && "border-current/60 text-current",
                )}
              >
                {status === "done" ? (
                  <Check className='h-4 w-4' />
                ) : status === "current" ? (
                  <span className='text-primary'>{i + 1}</span>
                ) : (
                  i + 1
                )}
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "my-1 w-px flex-1 bg-current",
                    status === "done" ? "opacity-70" : "opacity-25",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6", status === "upcoming" && "opacity-50")}>
              <p
                aria-current={status === "current" ? "step" : undefined}
                className='font-display text-sm font-semibold'
              >
                {step.label}
              </p>
              {step.description && (
                <p className='text-sm opacity-80'>{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
