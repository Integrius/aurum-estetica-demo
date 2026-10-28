export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-terracotta">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl leading-tight text-charcoal md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-charcoal/70 md:text-lg">{subtitle}</p>}
    </div>
  );
}
