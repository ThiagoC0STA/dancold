// Compact rounded flag glyphs used by the language switcher.
export function FlagBR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#199b3e" />
      <path d="M12 4.4 21 12l-9 7.6L3 12z" fill="#fedf00" />
      <circle cx="12" cy="12" r="3.8" fill="#002776" />
      <path d="M8.5 11.1c2.5-.4 5 .3 6.9 1.9l.1-.9c-2-1.5-4.6-2.1-7-1.8z" fill="#fff" />
    </svg>
  );
}

export function FlagUS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <clipPath id="us-round">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#us-round)">
        <rect width="24" height="24" fill="#fff" />
        {[0, 2, 4, 6, 8, 10].map((y) => (
          <rect key={y} y={y * 1.846} width="24" height="1.846" fill="#b22234" />
        ))}
        <rect width="11" height="9.2" fill="#3c3b6e" />
      </g>
    </svg>
  );
}

export function FlagES({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <clipPath id="es-round">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#es-round)">
        <rect width="24" height="24" fill="#aa151b" />
        <rect y="6" width="24" height="12" fill="#f1bf00" />
      </g>
    </svg>
  );
}
