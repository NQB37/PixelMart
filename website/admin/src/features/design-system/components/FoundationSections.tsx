import { ShoppingCart } from "lucide-react";
import { Badge, Button, Input, Spinner, cn } from "@website/shared/ui";
import { Caption, Grid, Row, Section, Spec, Swatch } from "./kit";

type Theme = "light" | "dark";

/** [class, light oklch, dark oklch] — values mirror shared/src/styles/theme.css. */
const SURFACES: [string, string, string][] = [
  ["bg-background", "0.99 0.006 165", "0.19 0.02 175"],
  ["bg-card", "1 0 0", "0.22 0.02 173"],
  ["bg-panel", "0.97 0.012 165", "0.22 0.02 173"],
  ["bg-popover", "1 0 0", "0.21 0.02 173"],
  ["bg-muted", "0.97 0.012 165", "0.26 0.02 172"],
  ["bg-accent", "0.93 0.05 160", "0.3 0.03 170"],
  ["bg-secondary", "0.95 0.035 165", "0.28 0.025 172"],
  ["bg-primary", "0.54 0.12 162", "0.78 0.15 165"],
];

const STATUS: [string, string, string][] = [
  ["bg-highlight", "0.66 0.18 35", "0.7 0.16 38"],
  ["bg-success", "0.62 0.15 155", "0.72 0.15 155"],
  ["bg-warning", "0.78 0.15 80", "0.8 0.15 82"],
  ["bg-destructive", "0.6 0.22 25", "0.62 0.2 25"],
  ["bg-info", "0.55 0.15 255", "0.74 0.13 255"],
];

const LINES: [string, string, string][] = [
  ["bg-border", "0.92 0.015 165", "0.3 0.02 172"],
  ["bg-input", "0.92 0.015 165", "0.32 0.02 172"],
  ["bg-ring", "0.54 0.12 162", "0.78 0.15 165"],
];

const CHARTS: [string, string, string][] = [
  ["bg-chart-1", "0.54 0.12 162", "0.78 0.15 165"],
  ["bg-chart-2", "0.66 0.18 35", "0.7 0.16 38"],
  ["bg-chart-3", "0.62 0.15 155", "0.72 0.15 155"],
  ["bg-chart-4", "0.78 0.15 80", "0.8 0.15 82"],
  ["bg-chart-5", "0.62 0.22 295", "0.62 0.22 295"],
];

const TEXT_TOKENS: [string, string][] = [
  ["text-foreground", "Body copy, table cells, headings"],
  ["text-muted-foreground", "Captions, placeholders, meta"],
  ["text-primary", "Links, active nav, emphasis"],
  ["text-secondary-foreground", "Copy on bg-secondary chips"],
  ["text-accent-foreground", "Copy on bg-accent hover rows"],
  ["text-primary-foreground", "Copy on bg-primary buttons"],
  ["text-destructive", "Field errors, delete copy"],
  ["text-success", "Confirmations, in-stock"],
  ["text-info", "Info banner icon, neutral notices"],
];

const SEMANTICS: [string, string, string][] = [
  ["Page background", "bg-background", "Shell behind every screen"],
  ["Surface", "bg-card", "Cards, tables, modals, sidebar panels"],
  ["Subtle surface", "bg-muted", "Skeletons, zebra rows, disabled fills"],
  ["Hover surface", "bg-accent", "Ghost buttons, menu items, nav hover"],
  ["Primary action", "bg-primary", "Submit, save, primary CTA, active nav"],
  ["Secondary action", "bg-secondary", "Cancel, filter chips, counters"],
  ["Sale / promo", "bg-highlight", "Discount badges, flash-sale banners"],
  ["Success", "bg-success", "Active user, in stock, approved vendor"],
  ["Warning", "bg-warning", "Pending review, low stock"],
  ["Info", "bg-info", "Neutral announcements — info banner and toast"],
  ["Danger", "bg-destructive", "Delete, ban, validation failure"],
  ["Field border", "border-input", "Input, textarea, select trigger"],
  ["Divider", "border-border", "Card edges, table rules, separators"],
  ["Focus ring", "ring-ring", "Every focusable element"],
  ["Data series", "bg-chart-1 … 5", "Charts, in order, no re-ordering"],
];

const TYPE_SCALE: [string, string, string, string][] = [
  ["text-xs", "12 / 16", "500", "Badge, caption, breadcrumb"],
  ["text-sm", "14 / 20", "400–500", "Helper text, table cell, meta"],
  ["text-base", "16 / 24", "400", "Body copy, product description, input"],
  ["text-lg", "18 / 28", "600", "Product name on card, sub-heading"],
  ["text-xl", "20 / 28", "700", "Card price, block title"],
  ["text-2xl", "24 / 32", "700", "Product name on detail page"],
  ["text-3xl", "30 / 36", "800", "Page title, detail-page price"],
  ["text-4xl", "36 / 40", "800", "Hero heading (mobile)"],
  ["text-5xl", "48 / 1", "800", "Hero heading (desktop)"],
];

const SPACE_SCALE: [string, string][] = [
  ["1", "4px"],
  ["2", "8px"],
  ["3", "12px"],
  ["4", "16px"],
  ["6", "24px"],
  ["8", "32px"],
  ["12", "48px"],
  ["16", "64px"],
  ["24", "96px"],
];

const SPACE_RULES: [string, string][] = [
  ["gap-2", "Icon ↔ label inside a button"],
  ["space-y-2", "Heading ↔ its supporting line"],
  ["p-4", "Padding inside a card"],
  ["space-y-4", "Blocks inside an admin page"],
  ["gap-4 md:gap-6", "Product grid gutters"],
  ["p-6", "Admin content area padding"],
  ["py-12 md:py-16 lg:py-24", "Storefront section rhythm"],
];

const RADII: [string, string, string][] = [
  ["rounded-sm", "8px", "Badge, chip, tag"],
  ["rounded-md", "10px", "Button, input, dropdown item"],
  ["rounded-lg", "12px", "Card, panel, dialog"],
  ["rounded-xl", "16px", "Banner, hero, admin panel"],
  ["rounded-full", "9999px", "Avatar, icon button, pill"],
];

const ELEVATION: [string, string][] = [
  ["shadow-xs", "Resting chip, inline control"],
  ["shadow-sm", "Card, table panel — the default"],
  ["shadow-md", "Sticky bar, hovered card"],
  ["shadow-lg", "Dropdown, select, dialog"],
  ["shadow-xl", "Full-bleed overlay panel"],
];

const BREAKPOINTS: [string, string, string][] = [
  ["sm", "640px", "2-col product grid, stacked filters"],
  ["md", "768px", "3-col product grid, sidebar filters"],
  ["lg", "1024px", "4-col product grid, admin sidebar open"],
  ["xl", "1280px", "Container reaches max-w-7xl"],
  ["2xl", "1536px", "Extra gutter only"],
];

const OPACITY: [string, string][] = [
  ["bg-primary/5", "Barely-there tint, hovered row"],
  ["bg-primary/10", "Active nav item, info alert fill"],
  ["bg-primary/20", "Slider thumb hover ring"],
  ["bg-black/50", "Dialog overlay"],
  ["bg-primary/90", "Primary button hover"],
  ["opacity-50", "Disabled anything"],
];

function TokenGrid({ rows, theme }: { rows: [string, string, string][]; theme: Theme }) {
  // 3-up, not 4: at 4 columns the spec strip truncates the longer token names.
  return (
    <Grid cols={3}>
      {rows.map(([className, light, dark]) => (
        <Swatch
          key={className}
          name={className}
          value={theme === "dark" ? dark : light}
          className={className}
          ring
        />
      ))}
    </Grid>
  );
}

export function FoundationSections({ theme }: { theme: Theme }) {
  return (
    <>
      <Section
        id="color"
        eyebrow="§1 Tokens"
        title="Color"
        rule="Every value is a complete OKLCH color in a CSS variable — use it through the Tailwind class, never a raw hex. Values below follow the theme you are previewing."
      >
        <div className="space-y-6">
          <div>
            <Caption>Surfaces &amp; brand</Caption>
            <div className="mt-3">
              <TokenGrid rows={SURFACES} theme={theme} />
            </div>
          </div>
          <div>
            <Caption>Commerce &amp; status</Caption>
            <div className="mt-3">
              <TokenGrid rows={STATUS} theme={theme} />
            </div>
          </div>
          <div>
            <Caption>Lines &amp; focus</Caption>
            <div className="mt-3">
              <TokenGrid rows={LINES} theme={theme} />
            </div>
          </div>
          <div>
            <Caption>Chart series — use in order</Caption>
            <div className="mt-3">
              <TokenGrid rows={CHARTS} theme={theme} />
            </div>
          </div>
          <div>
            <Caption>Text</Caption>
            <div className="mt-3">
              <Grid cols={3}>
                {TEXT_TOKENS.map(([className, usage]) => (
                  <div key={className} className="space-y-2">
                    <div className="flex h-14 items-center rounded-lg border border-border bg-background px-3">
                      <span
                        className={cn(
                          "font-display text-xl font-bold",
                          className,
                        )}
                      >
                        Aa
                      </span>
                      <span className="ml-2 truncate text-[11px] leading-4 text-muted-foreground">
                        {usage}
                      </span>
                    </div>
                    <Spec label={className} />
                  </div>
                ))}
              </Grid>
            </div>
          </div>
          <p className="rounded-md border border-warning/60 bg-warning/20 px-3 py-2 text-xs text-foreground">
            Deprecated: <span className="font-mono">neon-*</span>,{" "}
            <span className="font-mono">glow-*</span>,{" "}
            <span className="font-mono">pixel-border</span>,{" "}
            <span className="font-mono">scanlines</span>,{" "}
            <span className="font-mono">retro-grid</span> and{" "}
            <span className="font-mono">font-pixel</span> still exist for the
            client sweep. Do not use them in new UI.
          </p>
        </div>
      </Section>

      <Section
        id="semantic"
        eyebrow="§1 Tokens"
        title="Semantic tokens"
        rule="Pick a token by the job it does, not by the color it happens to be. Swapping the palette must never require touching a component."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </th>
                <th className="pb-2 pr-4 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Token
                </th>
                <th className="pb-2 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Where it belongs
                </th>
              </tr>
            </thead>
            <tbody>
              {SEMANTICS.map(([role, token, usage]) => (
                <tr key={token} className="border-b border-border last:border-b-0">
                  <td className="py-2.5 pr-4 font-medium text-foreground">
                    {role}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-primary">
                    {token}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="typography"
        eyebrow="§3 Type"
        title="Typography"
        rule="Plus Jakarta Sans (font-display) carries headings, prices and buttons; Inter (font-sans) carries everything else. Numbers that sit in a column get tabular-nums."
      >
        <div className="space-y-4">
          <Grid cols={3}>
            <div className="space-y-2">
              <p className="font-display text-2xl font-extrabold">
                Plus Jakarta Sans
              </p>
              <Spec label="font-display" value="600–800" />
            </div>
            <div className="space-y-2">
              <p className="font-sans text-2xl">Inter</p>
              <Spec label="font-sans" value="400–600" />
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl font-extrabold tabular-nums text-primary">
                1.290.000₫
              </p>
              <Spec label="tabular-nums" value="prices" />
            </div>
          </Grid>

          <div className="divide-y divide-border border-t border-border">
            {TYPE_SCALE.map(([className, metrics, weight, usage]) => (
              <div
                key={className}
                className="grid items-baseline gap-1 py-3 sm:grid-cols-[1fr_auto]"
              >
                <p
                  className={cn(
                    "truncate font-display font-bold text-foreground",
                    className,
                  )}
                >
                  Mint Fresh
                </p>
                <div className="flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] text-muted-foreground">
                  <span className="text-primary">{className}</span>
                  <span className="tabular-nums">{metrics}</span>
                  <span className="tabular-nums">w{weight}</span>
                  <span className="font-sans text-xs">{usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="spacing"
        eyebrow="§5 Spacing"
        title="Space"
        rule="One 4px grid, no exceptions. Reach for the named steps below before inventing a value."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            {SPACE_SCALE.map(([step, px]) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-8 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {step}
                </span>
                <div
                  className="h-3 rounded-sm bg-primary/70"
                  style={{ width: px }}
                />
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {px}
                </span>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {SPACE_RULES.map(([className, usage]) => (
              <div key={className} className="space-y-1.5">
                <Spec label={className} />
                <p className="text-xs text-muted-foreground">{usage}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="radius"
        eyebrow="§4 Radius"
        title="Radius"
        rule="Base --radius is 0.75rem (12px); every step derives from it with calc(). Soft corners are the brand — nothing in new UI is square."
      >
        <Grid cols={4}>
          {RADII.map(([className, px, usage]) => (
            <div key={className} className="space-y-2">
              <div
                className={cn(
                  "grid h-20 place-items-center border border-border bg-secondary text-secondary-foreground",
                  className,
                )}
              >
                <span className="font-mono text-[11px] tabular-nums">{px}</span>
              </div>
              <Spec label={className} value={px} />
              <p className="text-xs text-muted-foreground">{usage}</p>
            </div>
          ))}
        </Grid>
      </Section>

      <Section
        id="elevation"
        eyebrow="Elevation"
        title="Elevation"
        rule="There are no custom shadow tokens: the Tailwind ladder is the ladder. One step per layer of stacking — a card never wears a dialog's shadow."
      >
        <Grid cols={3}>
          {ELEVATION.map(([className, usage]) => (
            <div key={className} className="space-y-2">
              <div
                className={cn(
                  "h-20 rounded-lg border border-border bg-card",
                  className,
                )}
              />
              <Spec label={className} />
              <p className="text-xs text-muted-foreground">{usage}</p>
            </div>
          ))}
        </Grid>
      </Section>

      <Section
        id="layout"
        eyebrow="§5 Layout"
        title="Layout & grid"
        rule="Storefront pages centre on a 1280px container; the admin shell is a fixed sidebar plus a fluid content column. Product listings step 2 → 3 → 4 columns."
      >
        <div className="space-y-6">
          <Row label="Container" hint="Storefront page shell">
            <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3">
              <div className="rounded-md border border-border bg-card px-3 py-6 text-center text-xs text-muted-foreground">
                content column
              </div>
            </div>
            <div className="mt-2">
              <Spec label="max-w-7xl mx-auto px-4 md:px-6 lg:px-8" value="1280px" />
            </div>
          </Row>

          <Row label="Admin shell" hint="Sidebar + content">
            <div className="flex h-28 gap-2">
              <div className="grid w-24 place-items-center rounded-md border border-border bg-sidebar text-[11px] text-muted-foreground">
                w-64
              </div>
              <div className="flex-1 rounded-md border border-border bg-card p-2">
                <div className="grid h-6 place-items-center rounded-sm bg-muted text-[11px] text-muted-foreground">
                  h-16 header
                </div>
                <div className="mt-2 grid h-12 place-items-center rounded-sm border border-dashed border-border text-[11px] text-muted-foreground">
                  p-6 · space-y-4
                </div>
              </div>
            </div>
          </Row>

          <Row label="12-column grid" hint="gap-4 gutters">
            <div className="grid grid-cols-12 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="grid h-10 place-items-center rounded-sm bg-primary/10 font-mono text-[10px] tabular-nums text-primary"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </Row>

          <Row label="Product grid" hint="2 → 3 → 4 columns">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  <div className="aspect-square rounded-md bg-muted" />
                  <p className="mt-2 truncate text-xs font-medium">
                    Product {i + 1}
                  </p>
                  <p className="font-display text-sm font-bold tabular-nums text-primary">
                    290.000₫
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Spec label="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" />
            </div>
          </Row>

          <Row label="Breakpoints" hint="Tailwind defaults">
            <div className="divide-y divide-border">
              {BREAKPOINTS.map(([name, width, usage]) => (
                <div
                  key={name}
                  className="flex flex-wrap items-baseline gap-x-3 py-2 text-xs"
                >
                  <span className="w-8 font-mono text-primary">{name}</span>
                  <span className="w-16 font-mono tabular-nums text-muted-foreground">
                    {width}
                  </span>
                  <span className="text-muted-foreground">{usage}</span>
                </div>
              ))}
            </div>
          </Row>
        </div>
      </Section>

      <Section
        id="border"
        eyebrow="Stroke"
        title="Border & stroke"
        rule="Hairlines everywhere: 1px is the default weight. Fields use border-input, structure uses border-border, and icons are drawn at 1.5 stroke."
      >
        <div className="space-y-1">
          <Row label="Hairline" hint="Cards, tables, dividers">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-12 w-24 rounded-md border border-border bg-card" />
              <div className="h-px w-32 bg-border" />
              <Spec
                label="border border-border"
                value="1px"
                className="max-w-56"
              />
            </div>
          </Row>
          <Row label="Field" hint="Input, textarea, select">
            <div className="flex flex-wrap items-center gap-3">
              <Input className="h-10 w-40" placeholder="border-input" readOnly />
              <Spec label="border-input" value="1px" className="max-w-56" />
            </div>
          </Row>
          <Row label="Emphasis" hint="Switch track, slider thumb, active tab">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-12 w-24 rounded-md border-2 border-primary bg-primary/5" />
              <div className="h-0.5 w-24 rounded-full bg-primary" />
              <Spec label="border-2 border-primary" value="2px" className="max-w-56" />
            </div>
          </Row>
          <Row label="Dashed" hint="Dropzone, empty state">
            <div className="grid h-16 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              border-dashed
            </div>
          </Row>
          <Row label="Focus ring" hint="Tab to it — every control shares this">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm">
                Focus me
              </Button>
              <Spec
                label="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                className="max-w-80"
              />
            </div>
          </Row>
          <Row label="Icon stroke" hint="1.5 default, 2 below 16px">
            <div className="flex items-end gap-4">
              <div className="flex flex-col items-center gap-1">
                <ShoppingCart className="size-6" strokeWidth={1.5} />
                <span className="font-mono text-[10px] text-muted-foreground">
                  1.5
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShoppingCart className="size-6" strokeWidth={2} />
                <span className="font-mono text-[10px] text-muted-foreground">
                  2
                </span>
              </div>
            </div>
          </Row>
        </div>
      </Section>

      <Section
        id="state"
        eyebrow="Opacity"
        title="Opacity & state"
        rule="Tints come from opacity modifiers on a semantic token, never from a lighter hand-picked color. Disabled is always opacity-50 plus pointer-events-none."
      >
        <div className="space-y-6">
          <Grid cols={3}>
            {OPACITY.map(([className, usage]) => (
              <div key={className} className="space-y-2">
                <div
                  className={cn(
                    "h-12 rounded-md border border-border",
                    className,
                  )}
                />
                <Spec label={className} />
                <p className="text-xs text-muted-foreground">{usage}</p>
              </div>
            ))}
          </Grid>

          <div>
            <Caption>Interactive states — the contract every control keeps</Caption>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              {(
                [
                  ["Default", ""],
                  ["Hover", "bg-primary/90"],
                  ["Active", "bg-primary/80"],
                ] as const
              ).map(([label, className]) => (
                <div key={label} className="space-y-1.5">
                  <Button className={className}>Save changes</Button>
                  <Caption>{label}</Caption>
                </div>
              ))}
              <div className="space-y-1.5">
                <Button className="ring-2 ring-ring ring-offset-2 ring-offset-background">
                  Save changes
                </Button>
                <Caption>Focus</Caption>
              </div>
              <div className="space-y-1.5">
                <Button disabled>
                  <Spinner /> Saving
                </Button>
                <Caption>Loading</Caption>
              </div>
              <div className="space-y-1.5">
                <Button disabled>Save changes</Button>
                <Caption>Disabled</Caption>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Hover and active are shown with the class applied statically so you
              can compare them side by side.
            </p>
          </div>

          <div>
            <Caption>Status vocabulary — same word, same color, everywhere</Caption>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-success text-white">Active</Badge>
              <Badge className="bg-warning text-foreground">Pending</Badge>
              <Badge variant="destructive">Banned</Badge>
              <Badge variant="secondary">Draft</Badge>
              <Badge className="bg-highlight text-highlight-foreground">Sale</Badge>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
