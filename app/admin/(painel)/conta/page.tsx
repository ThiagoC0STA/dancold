import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/session";
import { PageHeader } from "@/components/admin/ui";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const { user } = await requireAdmin();

  return (
    <>
      <PageHeader title="Minha conta" description="Seu acesso ao painel." />

      <div className="grid max-w-[560px] gap-5">
        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2>E-mail de acesso</h2>
          </div>
          <p className="break-all px-5 pb-4 text-[14px] text-ink sm:px-5">{user.email}</p>
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2>Trocar a senha</h2>
          </div>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
