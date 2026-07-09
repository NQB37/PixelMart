export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-center">
      <h1 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This page is coming soon.
      </p>
    </div>
  );
}
