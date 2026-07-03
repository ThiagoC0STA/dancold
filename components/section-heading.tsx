import { Reveal } from "./reveal";

export function SectionHeading({
  kicker,
  title,
  intro,
  align = "left",
}: {
  kicker: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  /** @deprecated theme tokens handle light/dark now — kept so old call sites compile */
  light?: boolean;
}) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-6 bg-accent" aria-hidden />
        {kicker}
        {centered && <span className="h-px w-6 bg-accent" aria-hidden />}
      </p>
      <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </h2>
      {intro && <p className="mt-5 text-base leading-relaxed text-ink-2">{intro}</p>}
    </Reveal>
  );
}
