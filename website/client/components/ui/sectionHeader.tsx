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
    cyan: "text-neon-cyan glow-cyan",
    pink: "text-neon-pink glow-pink",
    green: "text-neon-green glow-green",
    yellow: "text-neon-yellow glow-yellow",
  };
  return (
    <div className=''>
      <div
        className={`flex items-baseline gap-2 font-pixel text-[10px] ${map[accent]}`}
      >
        {eyebrow.map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
      <h2 className='mt-2 font-pixel text-2xl md:text-3xl'>{title}</h2>
    </div>
  );
}
