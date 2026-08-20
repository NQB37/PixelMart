interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className='grid gap-1 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-4'>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='text-sm text-foreground'>{children}</dd>
    </div>
  );
}
