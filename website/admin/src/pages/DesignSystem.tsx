import { useEffect, useState } from "react";
import { Moon, MousePointerClick, Sun } from "lucide-react";
import { Button, cn } from "@website/shared/ui";
import { FoundationSections } from "@/features/design-system/components/FoundationSections";
import { ComponentSections } from "@/features/design-system/components/ComponentSections";

type Theme = "light" | "dark";

const FOUNDATION_LINKS = [
  ["color", "Color"],
  ["semantic", "Semantic tokens"],
  ["typography", "Typography"],
  ["spacing", "Space"],
  ["radius", "Radius"],
  ["elevation", "Elevation"],
  ["layout", "Layout & grid"],
  ["border", "Border & stroke"],
  ["state", "Opacity & state"],
] as const;

const COMPONENT_LINKS = [
  ["button", "Button"],
  ["input", "Text & select"],
  ["choice", "Checkbox, radio, switch"],
  ["badge", "Badge & pill"],
  ["avatar", "Avatar"],
  ["alert", "Alert banner"],
  ["tabs", "Tabs & segments"],
  ["navigation", "Breadcrumbs & pagination"],
  ["slider", "Slider"],
  ["disclosure", "Disclosure"],
  ["toast", "Toast"],
  ["modal", "Modal"],
  ["skeleton", "Skeleton"],
] as const;

const HERO_FACTS = [
  ["Display", "Plus Jakarta Sans"],
  ["Body", "Inter"],
  ["Radius", "0.75rem"],
  ["Color space", "OKLCH"],
] as const;

function Contents({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (next: Theme) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-0 lg:h-fit lg:py-1">
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex rounded-md bg-muted p-1">
          {(
            [
              ["light", Sun],
              ["dark", Moon],
            ] as const
          ).map(([value, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => onThemeChange(value)}
              aria-pressed={theme === value}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 font-display text-xs font-semibold capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                theme === value
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
              {value}
            </button>
          ))}
        </div>

        <nav className="mt-3 space-y-3 text-xs">
          {(
            [
              ["Foundations", FOUNDATION_LINKS],
              ["Components", COMPONENT_LINKS],
            ] as const
          ).map(([group, links]) => (
            <div key={group}>
              <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {group}
              </p>
              <ul>
                {links.map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="block truncate rounded-sm px-2 py-1 text-foreground/70 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="mt-3 flex items-start gap-1.5 border-t border-border pt-3 text-[11px] leading-4 text-muted-foreground">
          <MousePointerClick className="mt-px size-3.5 shrink-0" strokeWidth={1.5} />
          Click any spec strip to copy its token or class.
        </p>
      </div>
    </aside>
  );
}

export default function DesignSystem() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  const changeTheme = (next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  };

  // Leaving the page must not strand the rest of the admin in dark mode —
  // this preview is the only place that can switch it back.
  useEffect(
    () => () => document.documentElement.classList.remove("dark"),
    [],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="overflow-hidden rounded-xl bg-gradient-to-br from-primary via-emerald-400 to-teal-300 text-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/80">
              PixelMart · design system
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white">
              Mint Fresh
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              The tokens and components every PixelMart surface is built from.
              Values here are read from the live theme, so what you see is what
              ships — switch to dark and the numbers follow.
            </p>
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3">
            {HERO_FACTS.map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[10px] uppercase tracking-wide text-white/70">
                  {label}
                </dt>
                <dd className="font-display text-sm font-bold text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/25 bg-black/10 px-6 py-3 md:px-8">
          <span className="font-mono text-[11px] text-white/80">
            shared/src/styles/theme.css
          </span>
          <span className="text-white/40">·</span>
          <span className="font-mono text-[11px] text-white/80">
            @website/shared/ui
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="ml-auto bg-white/15 text-white hover:bg-white/25"
            onClick={() => changeTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
            Preview {theme === "dark" ? "light" : "dark"}
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <Contents theme={theme} onThemeChange={changeTheme} />
        <div className="min-w-0 space-y-10">
          <FoundationSections theme={theme} />
          <ComponentSections />
        </div>
      </div>
    </div>
  );
}
