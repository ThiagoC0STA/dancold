"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { IconExternal, IconMenu, IconOut, IconUser } from "./icons";

const ITEM = "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-medium text-ink-2 hover:bg-white/5 hover:text-ink";

/** Menu do celular: conta, ver o site e sair, a um toque do topo. */
export function AccountMenu({ email }: { email: string }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // trocou de página: fecha o menu
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <details ref={menu} className="group relative lg:hidden">
      <summary
        aria-label="Menu da conta"
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg text-ink-2 hover:bg-white/5 hover:text-ink group-open:bg-white/10 group-open:text-ink [&::-webkit-details-marker]:hidden"
      >
        <IconMenu />
      </summary>
      <div className="absolute right-0 top-12 z-40 w-[min(280px,calc(100vw-1.5rem))] rounded-xl border border-line bg-bg p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <p className="truncate px-3 pb-1.5 pt-1 text-[12.5px] text-ink-3">{email}</p>
        <Link href="/admin/conta" className={ITEM}>
          <IconUser />
          Minha conta
        </Link>
        <a href="/pt" target="_blank" rel="noopener noreferrer" className={ITEM}>
          <IconExternal />
          Ver o site
        </a>
        <form action={signOut}>
          <button type="submit" className={ITEM}>
            <IconOut />
            Sair
          </button>
        </form>
      </div>
    </details>
  );
}
