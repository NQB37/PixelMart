export default function SectionHeader({
  eyebrow,
  title,
  accent = "cyan",
}: {
  eyebrow: string[];
  title: string;
  accent?: "cyan" | "pink" | "green" | "yellow";
}) {
  const map = {
    cyan: "text-primary",
    pink: "text-highlight",
    green: "text-success",
    yellow: "text-warning",
  };
  return (
    <div className=''>
      <div
        className={`flex items-baseline gap-2 font-display text-xs font-semibold tracking-wide uppercase ${map[accent]}`}
      >
        {eyebrow.map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
      <h2 className='mt-2 font-display text-2xl font-bold md:text-3xl'>
        {title}
      </h2>
    </div>
  );
}
