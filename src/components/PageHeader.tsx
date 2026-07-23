export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-grid-dark border-b border-gold-400/20 bg-maroon-950 py-16 text-cream-100 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="inline-flex rounded-full border border-gold-400/40 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300">
          {eyebrow}
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-cream-100/70">
          {description}
        </p>
      </div>
    </section>
  );
}
