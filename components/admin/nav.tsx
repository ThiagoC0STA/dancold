"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChart, IconInbox, IconPen, IconUsers } from "./icons";

const ITEMS: {
  href: string;
  label: string;
  short?: string;
  icon: (p: { className?: string }) => React.ReactNode;
}[] = [
  { href: "/admin", label: "Visão geral", short: "Resumo", icon: IconChart },
  { href: "/admin/pedidos", label: "Pedidos", icon: IconInbox },
  { href: "/admin/visitantes", label: "Visitantes", icon: IconUsers },
  { href: "/admin/blog", label: "Blog", icon: IconPen },
];

export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel" className="adm-nav flex gap-1 lg:flex-col">
      {ITEMS.map(({ href, label, short, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-1 text-[13px] font-medium lg:flex-none lg:justify-start lg:gap-3 lg:px-3 lg:text-[14px] text-ink-2 transition-colors hover:bg-white/5 hover:text-ink"
          >
            <Icon className="hidden h-5 w-5 lg:block" />
            {/* no celular são cinco itens numa linha: nome curto para não quebrar */}
            {short ? (
              <>
                <span className="lg:hidden">{short}</span>
                <span className="hidden lg:inline">{label}</span>
              </>
            ) : (
              label
            )}
            {href === "/admin/pedidos" && newLeads > 0 && (
              <span
                className="rounded-md lg:ml-auto bg-accent px-1.5 text-[12px] font-semibold leading-5 text-white"
                aria-label={`${newLeads} novos`}
              >
                {newLeads}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
