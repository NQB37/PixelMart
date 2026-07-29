import { useState } from "react";
import {
  Bell,
  ChevronRight,
  CircleCheck,
  CircleX,
  Download,
  Info,
  Mail,
  Package,
  Plus,
  Search,
  Store,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  Badge,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FieldError,
  Input,
  Label,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  cn,
} from "@website/shared/ui";
import { Caption, Grid, Row, Section, Spec } from "./kit";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

// Commerce tones are not variants: they are token classNames layered on a variant,
// so the shared Button stays exactly the shadcn set.
const BUTTON_TONES = [
  ["highlight", "bg-highlight text-highlight-foreground hover:bg-highlight/90"],
  ["success", "bg-success text-white hover:bg-success/90"],
  ["warning", "bg-warning text-foreground hover:bg-warning/90"],
] as const;

const NATIVE_SELECT_CLASS =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

function ButtonSection() {
  return (
    <Section
      id="button"
      eyebrow="Action"
      title="Button"
      rule="One primary action per view. The label says what happens — “Save changes”, not “Submit” — and keeps that wording through the toast that follows."
    >
      <div className="space-y-1">
        <Row label="Variants" hint="6 tones, one job each">
          <div className="flex flex-wrap items-center gap-2">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
        </Row>

        <Row label="Commerce tones" hint="className on top of a variant">
          <div className="flex flex-wrap items-center gap-2">
            {BUTTON_TONES.map(([tone, className]) => (
              <Button key={tone} className={className}>
                {tone}
              </Button>
            ))}
          </div>
        </Row>

        <Row label="Sizes" hint="Padding-based, 28 / 40 / 48px">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="mt-3 max-w-xs">
            <Spec label='size="sm" | "default" | "lg"' />
          </div>
        </Row>

        <Row label="With icon" hint="Leading, trailing, icon-only">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus />
              Add product
            </Button>
            <Button variant="outline">
              Export CSV
              <Download />
            </Button>
            <Button size="icon" variant="outline" aria-label="Filter">
              <Search />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Notifications">
              <Bell />
            </Button>
            <Button size="icon-lg" variant="destructive" aria-label="Delete">
              <Trash2 />
            </Button>
          </div>
          <div className="mt-3 max-w-md">
            <Spec label='size="icon" | "icon-sm" | "icon-lg"' value="always add aria-label" />
          </div>
        </Row>

        <Row label="States" hint="Loading swaps in the spinner and blocks input">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Button>Save changes</Button>
              <Caption>Default</Caption>
            </div>
            <div className="space-y-1.5">
              <Button className="bg-primary/90">Save changes</Button>
              <Caption>Hover</Caption>
            </div>
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
        </Row>
      </div>
    </Section>
  );
}

function TextInputSection() {
  const [amount, setAmount] = useState("12");

  return (
    <Section
      id="input"
      eyebrow="Form"
      title="Text, select, textarea & number"
      rule="Fields are 44px tall so they stay tappable. Label every one, keep helper text below it, and let the error message replace the helper rather than sit next to it."
    >
      <div className="space-y-1">
        <Row label="Types" hint="Native input types, one theme">
          <Grid cols={2}>
            {(
              [
                ["text", "Nguyễn Bảo"],
                ["email", "you@pixelmart.vn"],
                ["password", "••••••••"],
                ["url", "https://pixelmart.vn"],
                ["date", ""],
                ["time", ""],
              ] as const
            ).map(([type, placeholder]) => (
              <div key={type} className="space-y-1.5">
                <Label htmlFor={`type-${type}`}>{type}</Label>
                <Input
                  id={`type-${type}`}
                  type={type}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </Grid>
        </Row>

        <Row label="Number" hint="tabular-nums so digits stay in column">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-32 space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="tabular-nums"
              />
            </div>
            <div className="w-40 space-y-1.5">
              <Label htmlFor="price">Price (₫)</Label>
              <Input
                id="price"
                type="number"
                step={1000}
                defaultValue={290000}
                className="tabular-nums"
              />
            </div>
          </div>
        </Row>

        <Row label="With icon" hint="Icon sits left, field gets pl-9">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search products" />
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" type="email" placeholder="Email" />
            </div>
          </div>
        </Row>

        <Row label="States" hint="Tab into the third field to see the ring">
          <Grid cols={2}>
            <div className="space-y-1.5">
              <Label>Empty</Label>
              <Input placeholder="Placeholder copy" />
            </div>
            <div className="space-y-1.5">
              <Label>Filled</Label>
              <Input defaultValue="Wireless earbuds" />
            </div>
            <div className="space-y-1.5">
              <Label>Focus</Label>
              <Input
                placeholder="Tab to me"
                className="ring-2 ring-ring ring-offset-2 ring-offset-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Read-only</Label>
              <Input readOnly defaultValue="SKU-4821-A" className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label>Disabled</Label>
              <Input disabled defaultValue="Locked while syncing" />
            </div>
            <div className="space-y-1.5">
              <Label>Invalid</Label>
              <Input aria-invalid defaultValue="bao@" className="border-destructive" />
              <FieldError>Enter a full email address.</FieldError>
            </div>
          </Grid>
        </Row>

        <Row label="Textarea" hint="Grows with its content">
          <div className="space-y-1.5">
            <Label htmlFor="desc">Product description</Label>
            <Textarea
              id="desc"
              placeholder="What makes this product worth buying?"
            />
            <p className="text-xs text-muted-foreground">
              Markdown is not supported — write plain sentences.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Disabled</Label>
              <Textarea disabled defaultValue="Locked while the listing is under review." />
            </div>
            <div className="space-y-1.5">
              <Label>Invalid</Label>
              <Textarea aria-invalid className="border-destructive" defaultValue="Too short" />
              <FieldError>Description needs at least 40 characters.</FieldError>
            </div>
          </div>
        </Row>

        <Row label="Select" hint="Rich picker with groups and check state">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Electronics</SelectLabel>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="laptops">Laptops</SelectItem>
                    <SelectItem value="phones">Phones</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Home</SelectLabel>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="lighting" disabled>
                      Lighting — coming soon
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Small / disabled</Label>
              <div className="flex gap-2">
                <Select defaultValue="active">
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select disabled>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Disabled" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Row>

        <Row label="Native select" hint="Themed in theme.css — use it for plain filters">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select id="role" className={NATIVE_SELECT_CLASS} defaultValue="">
                <option value="">All roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="VENDOR">Vendor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Disabled</Label>
              <select className={NATIVE_SELECT_CLASS} disabled>
                <option>All statuses</option>
              </select>
            </div>
          </div>
        </Row>
      </div>
    </Section>
  );
}

function ChoiceSection() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(
    "indeterminate",
  );
  const [plan, setPlan] = useState("standard");

  return (
    <Section
      id="choice"
      eyebrow="Form"
      title="Checkbox, radio & switch"
      rule="Checkbox for “any of these”, radio for “exactly one of these”, switch for a setting that applies the moment it moves — no Save button behind it."
    >
      <div className="space-y-1">
        <Row label="Checkbox" hint="Indeterminate is a parent with mixed children">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {(
              [
                ["Unchecked", false, false],
                ["Checked", true, false],
                ["Disabled", false, true],
                ["Disabled checked", true, true],
              ] as const
            ).map(([label, isChecked, isDisabled]) => (
              <div key={label} className="flex items-center gap-2">
                <Checkbox
                  id={`cb-${label.toLowerCase().replace(/ /g, "-")}`}
                  defaultChecked={isChecked}
                  disabled={isDisabled}
                />
                <Label
                  htmlFor={`cb-${label.toLowerCase().replace(/ /g, "-")}`}
                  className={cn(isDisabled && "opacity-50")}
                >
                  {label}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox id="cb-invalid" aria-invalid />
              <Label htmlFor="cb-invalid" className="text-destructive">
                Invalid
              </Label>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="cb-parent"
                checked={checked === true}
                indeterminate={checked === "indeterminate"}
                onCheckedChange={(next) => setChecked(next)}
              />
              <Label htmlFor="cb-parent">
                Select all vendors — live, click through the three states
              </Label>
            </div>
            <p className="mt-1.5 pl-6 font-mono text-[11px] text-muted-foreground">
              checked = {String(checked)}
            </p>
          </div>
        </Row>

        <Row label="Radio" hint="Always ships with a default selection">
          <RadioGroup value={plan} onValueChange={setPlan}>
            {(
              [
                ["standard", "Standard delivery", "3–5 days, free"],
                ["express", "Express delivery", "Next day, 39.000₫"],
                ["pickup", "Store pickup", "Ready in 2 hours"],
              ] as const
            ).map(([value, label, hint]) => (
              <div key={value} className="flex items-start gap-2.5">
                <RadioGroupItem value={value} id={`plan-${value}`} className="mt-0.5" />
                <div>
                  <Label htmlFor={`plan-${value}`}>{label}</Label>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2.5 opacity-50">
              <RadioGroupItem value="courier" id="plan-courier" disabled className="mt-0.5" />
              <div>
                <Label htmlFor="plan-courier">Same-day courier</Label>
                <p className="text-xs text-muted-foreground">
                  Unavailable in this district
                </p>
              </div>
            </div>
          </RadioGroup>
        </Row>

        <Row label="Switch" hint="Applies immediately, so label the outcome">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {(
              [
                ["Off", false, false],
                ["On", true, false],
                ["Disabled off", false, true],
                ["Disabled on", true, true],
              ] as const
            ).map(([label, isOn, isDisabled]) => (
              <div key={label} className="flex items-center gap-2">
                <Switch
                  id={`sw-${label.toLowerCase().replace(/ /g, "-")}`}
                  defaultChecked={isOn}
                  disabled={isDisabled}
                />
                <Label
                  htmlFor={`sw-${label.toLowerCase().replace(/ /g, "-")}`}
                  className={cn(isDisabled && "opacity-50")}
                >
                  {label}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Switch id="sw-small" size="sm" defaultChecked />
              <Label htmlFor="sw-small">Small</Label>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <Label htmlFor="sw-live">Show out-of-stock products</Label>
              <p className="text-xs text-muted-foreground">
                Shoppers see them greyed out instead of hidden.
              </p>
            </div>
            <Switch id="sw-live" defaultChecked />
          </div>
        </Row>
      </div>
    </Section>
  );
}

function BadgeSection() {
  return (
    <Section
      id="badge"
      eyebrow="Status"
      title="Badge, tag & status pill"
      rule="A badge states a fact in one or two words. Colour carries the meaning, so never use two tones for the same status across two screens."
    >
      <div className="space-y-1">
        <Row label="Variants" hint="Uppercase, 8px radius">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-success text-white">Active</Badge>
            <Badge className="bg-warning text-foreground">Pending</Badge>
            <Badge variant="destructive">Banned</Badge>
            <Badge className="bg-highlight text-highlight-foreground">
              -30%
            </Badge>
          </div>
        </Row>

        <Row label="Status pill" hint="Badge + rounded-full + a dot">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["bg-success text-white", "In stock"],
                ["bg-warning text-foreground", "Low stock"],
                ["bg-destructive text-destructive-foreground", "Out of stock"],
                ["bg-secondary text-secondary-foreground", "Draft"],
              ] as const
            ).map(([tone, label]) => (
              <Badge key={label} className={cn("gap-1.5 rounded-full", tone)}>
                <span className="size-1.5 rounded-full bg-current" />
                {label}
              </Badge>
            ))}
          </div>
          <div className="mt-3 max-w-md">
            <Spec label='<Badge className="gap-1.5 rounded-full">' value="no new component" />
          </div>
        </Row>

        <Row label="Tag" hint="User-authored, so keep the original casing">
          <div className="flex flex-wrap gap-2">
            {["wireless", "noise-cancelling", "bluetooth 5.3", "usb-c"].map(
              (tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full normal-case tracking-normal"
                >
                  {tag}
                </Badge>
              ),
            )}
          </div>
        </Row>

        <Row label="In context" hint="Sits inline with the thing it describes">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <span className="grid size-9 place-items-center rounded-md bg-secondary text-secondary-foreground">
              <Package className="size-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                Aurora Wireless Earbuds
              </p>
              <p className="text-xs text-muted-foreground">SKU-4821-A</p>
            </div>
            <Badge className="bg-highlight text-highlight-foreground">Sale</Badge>
            <Badge className="gap-1.5 rounded-full bg-success text-white">
              <span className="size-1.5 rounded-full bg-current" />
              In stock
            </Badge>
          </div>
        </Row>
      </div>
    </Section>
  );
}

function AvatarSection() {
  return (
    <Section
      id="avatar"
      eyebrow="Identity"
      title="Avatar"
      rule="Initials are the fallback, not a placeholder image. Presence dots only appear where presence is real data — never decoration."
    >
      <div className="space-y-1">
        <Row label="Sizes" hint="28 / 36 / 44px">
          <div className="flex items-end gap-4">
            {(["sm", "default", "lg"] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-1.5">
                <Avatar size={size}>
                  <AvatarFallback>BN</AvatarFallback>
                </Avatar>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {size}
                </span>
              </div>
            ))}
          </div>
        </Row>

        <Row label="Fallback" hint="Initials, or an icon for a non-person">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>BN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary/15 text-primary">
                QA
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>
                <Store className="size-4" strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-3 max-w-md">
            <Spec label="<AvatarImage> + <AvatarFallback>" value="image wins" />
          </div>
        </Row>

        <Row label="Presence" hint="online · away · busy · offline">
          <div className="flex items-center gap-5">
            {(
              [
                ["online", "bg-success"],
                ["away", "bg-warning"],
                ["busy", "bg-destructive"],
                ["offline", "bg-muted-foreground"],
              ] as const
            ).map(([presence, tone]) => (
              <div key={presence} className="flex flex-col items-center gap-1.5">
                <Avatar size="lg">
                  <AvatarFallback>BN</AvatarFallback>
                  <AvatarBadge className={tone} />
                </Avatar>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {presence}
                </span>
              </div>
            ))}
          </div>
        </Row>

        <Row label="Group" hint="Overflow count closes the stack">
          <div className="space-y-4">
            <AvatarGroup>
              {["BN", "TL", "MK"].map((initials) => (
                <Avatar key={initials}>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+7</AvatarGroupCount>
            </AvatarGroup>
            <AvatarGroup className="-space-x-1.5">
              {["BN", "TL"].map((initials) => (
                <Avatar key={initials} size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
          </div>
        </Row>
      </div>
    </Section>
  );
}

function AlertSection() {
  return (
    <Section
      id="alert"
      eyebrow="Feedback"
      title="Alert banner"
      rule="Use a banner for something the reader must act on or understand before continuing. Say what happened and what to do next — never apologise, never stay vague."
    >
      <div className="space-y-3">
        <Alert className="border-info/40 bg-info/10 text-foreground [&>svg]:text-info">
          <Info />
          <AlertTitle>Payouts move to weekly on 1 August</AlertTitle>
          <AlertDescription>
            Nothing to do now. Vendors will see the new schedule on their payout
            page.
          </AlertDescription>
        </Alert>

        <Alert className="border-success/40 bg-success/10 text-foreground [&>svg]:text-success">
          <CircleCheck />
          <AlertTitle>Vendor approved</AlertTitle>
          <AlertDescription>
            Aurora Audio can publish products from now on.
          </AlertDescription>
        </Alert>

        <Alert className="border-warning/60 bg-warning/20 text-foreground [&>svg]:text-warning">
          <TriangleAlert />
          <AlertTitle>12 listings are waiting for review</AlertTitle>
          <AlertDescription>
            Listings older than 48 hours are auto-hidden from search.
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <CircleX />
          <AlertTitle>Could not import the catalogue</AlertTitle>
          <AlertDescription>
            Row 42 has no price. Fix the file and upload it again.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertDescription>
            Plain banner, no icon and no title — the default tone for neutral
            notes.
          </AlertDescription>
        </Alert>

        <div className="grid gap-2 sm:grid-cols-2">
          <Spec label='variant="default" | "destructive" (+ tone className)' />
          <Spec label='<Alert><Icon /><AlertTitle /><AlertDescription />' />
        </div>
        <p className="text-xs text-muted-foreground">
          Info is blue, not mint: it has to read as neutral news rather than a
          brand moment. Only the error tone colours its text — the rest keep{" "}
          <span className="font-mono">text-foreground</span> at full contrast on
          the tint and let the icon carry the tone.
        </p>
      </div>
    </Section>
  );
}

function TabsSection() {
  return (
    <Section
      id="tabs"
      eyebrow="Navigation"
      title="Tabs & segments"
      rule="Tabs switch the view without changing the page. Underline for page-level sections, segment for a control that filters what is below it."
    >
      <div className="space-y-1">
        <Row label="Underline" hint="Page-level sections">
          <Tabs defaultValue="overview">
            <TabsList variant="line">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">
                Products
                <Badge variant="secondary" className="rounded-full">
                  128
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="audit" disabled>
                Audit log
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-1 text-sm text-muted-foreground">
              Revenue, orders and refunds for the selected period.
            </TabsContent>
            <TabsContent value="products" className="pt-1 text-sm text-muted-foreground">
              Every listing this vendor has published.
            </TabsContent>
            <TabsContent value="payouts" className="pt-1 text-sm text-muted-foreground">
              Scheduled and completed transfers.
            </TabsContent>
          </Tabs>
        </Row>

        <Row label="Segment" hint="Filters the content below">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="text-sm text-muted-foreground">
              1.284 users
            </TabsContent>
            <TabsContent value="active" className="text-sm text-muted-foreground">
              1.190 users
            </TabsContent>
            <TabsContent value="banned" className="text-sm text-muted-foreground">
              94 users
            </TabsContent>
          </Tabs>
          <div className="mt-3 max-w-md">
            <Spec label='<TabsList variant="line" | "default">' />
          </div>
        </Row>

      </div>
    </Section>
  );
}

function NavigationSection() {
  const [page, setPage] = useState(3);
  const totalPages = 8;

  return (
    <Section
      id="navigation"
      eyebrow="Navigation"
      title="Breadcrumbs & pagination"
      rule="Breadcrumbs show where you are, not where you have been — mirror the route. Pagination always says which page of how many."
    >
      <div className="space-y-1">
        <Row label="Breadcrumbs" hint="Last crumb is the current page">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#navigation">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#navigation">Catalog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Categories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#navigation">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#navigation">Vendors</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Aurora Audio</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mt-3 max-w-md">
            <Spec label="breadcrumbLinkClass" value="for router links" />
          </div>
        </Row>

        <Row label="Pagination" hint="Live — click through the pages">
          <div className="space-y-3">
            <Pagination className="justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                    className={cn(page === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
                {[1, 2, 3].map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink
                      isActive={page === n}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    isActive={page === totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages}
                    className={cn(
                      page === totalPages && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-sm text-muted-foreground">
              Page <span className="tabular-nums">{page}</span> of{" "}
              <span className="tabular-nums">{totalPages}</span> · 1.284 users
            </p>
          </div>
        </Row>
      </div>
    </Section>
  );
}

function SliderSection() {
  const [price, setPrice] = useState([120000, 640000]);
  const [stock, setStock] = useState([40]);
  const money = (value: number) => value.toLocaleString("vi-VN");

  return (
    <Section
      id="slider"
      eyebrow="Input"
      title="Slider"
      rule="Only for ranges where the exact number matters less than the feel of it. Always show the current value — a slider without a readout is a guess."
    >
      <div className="space-y-1">
        <Row label="Single value" hint="Keyboard: arrows, Home, End">
          <div className="max-w-md space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Minimum stock alert</Label>
              <span className="font-display text-sm font-bold tabular-nums text-primary">
                {stock[0]} units
              </span>
            </div>
            <Slider
              value={stock}
              onValueChange={(v) => setStock(v as number[])}
              max={200}
              step={5}
            />
          </div>
        </Row>

        <Row label="Range" hint="Two thumbs, one track">
          <div className="max-w-md space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Price range</Label>
              <span className="font-display text-sm font-bold tabular-nums text-primary">
                {money(price[0])}₫ – {money(price[1])}₫
              </span>
            </div>
            <Slider
              value={price}
              onValueChange={(v) => setPrice(v as number[])}
              min={0}
              max={1000000}
              step={10000}
            />
          </div>
        </Row>

        <Row label="Disabled" hint="Reads at 50% opacity">
          <div className="max-w-md">
            <Slider defaultValue={[30]} disabled />
          </div>
        </Row>
      </div>
    </Section>
  );
}

function DisclosureSection() {
  return (
    <Section
      id="disclosure"
      eyebrow="Structure"
      title="Disclosure"
      rule="Hide detail, never decisions. The trigger reads as the question the reader is asking, so it still makes sense collapsed."
    >
      <div className="space-y-1">
        <Row label="Single" hint="One panel open at a time">
          <Accordion multiple={false} defaultValue={["shipping"]}>
            <AccordionItem value="shipping">
              <AccordionTrigger>How long does delivery take?</AccordionTrigger>
              <AccordionContent>
                Standard delivery arrives in 3–5 working days. Express orders
                placed before 4pm arrive the next day.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Can I return an opened item?</AccordionTrigger>
              <AccordionContent>
                Yes, within 14 days, as long as every accessory is in the box.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="warranty">
              <AccordionTrigger>Who handles the warranty?</AccordionTrigger>
              <AccordionContent>
                The vendor handles it directly. Their contact details sit on the
                order page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Row>

        <Row label="Multiple" hint="Filter groups in a sidebar">
          <Accordion defaultValue={["brand"]}>
            <AccordionItem value="brand">
              <AccordionTrigger>Brand</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {["Aurora Audio", "Nimbus", "Kito"].map((brand) => (
                    <div key={brand} className="flex items-center gap-2">
                      <Checkbox id={`brand-${brand}`} />
                      <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rating">
              <AccordionTrigger>Rating</AccordionTrigger>
              <AccordionContent>4 stars and up · 3 stars and up</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Row>
      </div>
    </Section>
  );
}

function ToastSection() {
  return (
    <Section
      id="toast"
      eyebrow="Feedback"
      title="Toast"
      rule="Confirms something that already happened, in the past tense, using the same verb as the button that caused it. Anything the reader must act on belongs in a banner instead."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-success text-white hover:bg-success/90"
            onClick={() => toast.success("Brand Aurora Audio created")}
          >
            <CircleCheck />
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info("Export queued — we will email the file")}
          >
            <Info />
            Info
          </Button>
          <Button
            className="bg-warning text-foreground hover:bg-warning/90"
            onClick={() => toast.warning("2 listings skipped: no price")}
          >
            <TriangleAlert />
            Warning
          </Button>
          <Button
            variant="destructive"
            onClick={() => toast.error("Could not save the category")}
          >
            <CircleX />
            Error
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Spec label='toast.success("Brand Aurora Audio created")' />
          <Spec label="ToastContainer" value="mounted in App.tsx" />
        </div>
        <p className="text-xs text-muted-foreground">
          react-toastify, re-skinned with theme tokens, so toasts follow the
          light/dark switch above. Copy stays under ten words.
        </p>
      </div>
    </Section>
  );
}

// Self-contained modal: owns its trigger and its own open state (CLAUDE.md pattern).
function DemoDialog() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Add brand
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add brand</DialogTitle>
          <DialogDescription>
            Products are listed under a brand. Names must be unique.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="brand-name">Brand name</Label>
          <Input id="brand-name" placeholder="Aurora Audio" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button
            onClick={() => {
              setIsOpened(false);
              toast.success("Brand Aurora Audio created");
            }}
          >
            Add brand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DestructiveDialog() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened}>
      <DialogTrigger
        render={
          <Button variant="destructive">
            <Trash2 />
            Delete category
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete “Headphones”?</DialogTitle>
          <DialogDescription>
            12 products move to Uncategorised. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Keep category</Button>} />
          <Button
            variant="destructive"
            onClick={() => {
              setIsOpened(false);
              toast.success("Category Headphones deleted");
            }}
          >
            Delete category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalSection() {
  return (
    <Section
      id="modal"
      eyebrow="Overlay"
      title="Modal"
      rule="Every modal is self-contained: it renders its own trigger and owns its open state. The confirm button repeats the verb — “Delete category”, never “OK”."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <DemoDialog />
          <DestructiveDialog />
        </div>
        <div className="max-w-lg">
          <Spec label="Dialog / DialogTrigger / DialogContent / DialogFooter" />
        </div>
      </div>
    </Section>
  );
}

function SkeletonSection() {
  const [loaded, setLoaded] = useState(false);

  return (
    <Section
      id="skeleton"
      eyebrow="Loading"
      title="Skeleton"
      rule="Match the shape of the content that is coming, at the same size, so nothing jumps when it lands. Never mix a skeleton with a spinner in the same block."
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Switch
            id="skeleton-loaded"
            checked={loaded}
            onCheckedChange={setLoaded}
          />
          <Label htmlFor="skeleton-loaded">Show the loaded state</Label>
        </div>

        <div>
          <Caption>Product card</Caption>
          <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) =>
              loaded ? (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  <div className="grid aspect-square place-items-center rounded-md bg-secondary">
                    <Package
                      className="size-6 text-secondary-foreground"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="mt-3 truncate text-sm font-medium">
                    Aurora Earbuds
                  </p>
                  <p className="text-xs text-muted-foreground">Aurora Audio</p>
                  <p className="mt-1 font-display text-base font-bold tabular-nums text-primary">
                    290.000₫
                  </p>
                </div>
              ) : (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="mt-3 h-4 w-4/5" />
                  <Skeleton className="mt-2 h-3 w-2/5" />
                  <Skeleton className="mt-3 h-5 w-1/2" />
                </div>
              ),
            )}
          </div>
        </div>

        <div>
          <Caption>List row</Caption>
          <div className="mt-3 divide-y divide-border rounded-lg border border-border">
            {Array.from({ length: 3 }, (_, i) =>
              loaded ? (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Avatar>
                    <AvatarFallback>BN</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Bảo Nguyễn</p>
                    <p className="truncate text-xs text-muted-foreground">
                      bao.nguyen@pixelmart.vn
                    </p>
                  </div>
                  <Badge className="bg-success text-white">Active</Badge>
                  <Button variant="ghost" size="icon-sm" aria-label="Open">
                    <ChevronRight />
                  </Button>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-sm" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              ),
            )}
          </div>
        </div>

        <div className="max-w-md">
          <Spec label="animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </Section>
  );
}

export function ComponentSections() {
  return (
    <>
      <ButtonSection />
      <TextInputSection />
      <ChoiceSection />
      <BadgeSection />
      <AvatarSection />
      <AlertSection />
      <TabsSection />
      <NavigationSection />
      <SliderSection />
      <DisclosureSection />
      <ToastSection />
      <ModalSection />
      <SkeletonSection />
    </>
  );
}
