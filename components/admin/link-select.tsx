"use client";

import { useRouter } from "next/navigation";

/** Seletor que troca de página ao escolher: substitui abas que não cabem no celular. */
export function LinkSelect({
  label,
  options,
  value,
  className = "",
}: {
  label: string;
  options: { href: string; label: string }[];
  value: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <label className={`block ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => router.push(event.target.value, { scroll: false })}
        className="adm-input mt-0 h-10 appearance-auto font-medium"
      >
        {options.map((option) => (
          <option key={option.href} value={option.href}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
