import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { AdminNav } from "@/components/admin/nav";
import { AccountMenu } from "@/components/admin/account-menu";
import { IconExternal, IconOut, IconUser } from "@/components/admin/icons";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { supabase, user } = await requireAdmin();
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "novo");

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="section-dark sticky top-0 z-20 flex flex-col gap-3 bg-bg px-3 py-3 lg:h-screen lg:gap-6 lg:px-4 lg:py-5">
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" aria-label="Painel Dancold">
            <Image src="/logo-light.webp" alt="Dancold" width={120} height={32} loading="eager" className="h-7 w-auto" />
          </Link>
          <AccountMenu email={user.email ?? ""} />
        </div>

        <AdminNav newLeads={count ?? 0} />

        <div className="mt-auto hidden space-y-1 border-t border-line pt-4 lg:block">
          <Link
            href="/admin/conta"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-ink-2 transition-colors hover:bg-white/5 hover:text-ink"
          >
            <IconUser />
            Minha conta
          </Link>
          <a
            href="/pt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-ink-2 transition-colors hover:bg-white/5 hover:text-ink"
          >
            <IconExternal />
            Ver o site
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-medium text-ink-2 transition-colors hover:bg-white/5 hover:text-ink"
            >
              <IconOut />
              Sair
            </button>
          </form>
          <p className="truncate px-3 pt-2 text-[12.5px] text-ink-3" title={user.email ?? ""}>
            {user.email}
          </p>
        </div>
      </aside>

      <main className="min-w-0 bg-bg">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-8 lg:py-9">{children}</div>
      </main>
    </div>
  );
}
