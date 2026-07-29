import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@website/shared/ui";

/**
 * Building blocks for the design-system page. Every specimen sits above a
 * hairline "spec strip": token/class on the left, value on the right, and the
 * whole strip copies the string a developer actually needs to paste.
 */

// ponytail: no cleanup on the reset timer — worst case it fires after unmount,
// which React 19 ignores. A ref + clearTimeout buys nothing here.
function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };

  return { copied, copy };
}

export function Spec({
  label,
  value,
  className,
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  const { copied, copy } = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(label)}
      title={`Copy "${label}"`}
      className={cn(
        "group flex w-full items-baseline gap-2 rounded-sm border-t border-border pt-1.5 text-left font-mono text-[11px] leading-4 outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span className="truncate text-foreground/80 group-hover:text-primary">
        {label}
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-1 tabular-nums text-muted-foreground">
        {copied ? (
          <>
            <Check className="size-3 text-success" strokeWidth={2} />
            copied
          </>
        ) : (
          <>
            {value}
            <Copy
              className="size-3 opacity-0 transition-opacity group-hover:opacity-60"
              strokeWidth={1.5}
            />
          </>
        )}
      </span>
    </button>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  rule,
  children,
}: {
  id: string;
  /** Cross-reference into DESIGN.md, e.g. "§4 Radius". */
  eyebrow: string;
  title: string;
  rule: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs font-medium text-primary">
          {eyebrow}
        </span>
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{rule}</p>
      <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        {children}
      </div>
    </section>
  );
}

/** A labelled specimen row: caption on the left, live component on the right. */
export function Row({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[10rem_1fr] sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-foreground">
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Caption under a free-standing specimen (used inside grids). */
export function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground">{children}</p>
  );
}

export function Grid({
  cols = 4,
  children,
}: {
  cols?: 2 | 3 | 4 | 6;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-2 sm:grid-cols-3",
        cols === 4 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        cols === 6 && "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
      )}
    >
      {children}
    </div>
  );
}

export function Swatch({
  name,
  value,
  className,
  ring,
}: {
  name: string;
  value: string;
  className: string;
  ring?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "h-14 rounded-lg",
          ring ? "border border-border" : "border border-transparent",
          className,
        )}
      />
      <Spec label={name} value={value} />
    </div>
  );
}
