"use client";

import { useEffect } from "react";
import { IconRetry } from "@/components/admin/icons";

/** Falha ao carregar (rede, banco fora do ar): explica e deixa tentar de novo. */
export default function PanelError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error("[painel]", error);
  }, [error]);

  return (
    <div className="adm-panel px-5 py-12 text-center">
      <p className="text-[15px] font-semibold text-ink">Não foi possível carregar esta tela</p>
      <p className="mx-auto mt-1.5 max-w-[48ch] text-[13.5px] text-ink-2">
        Pode ser a internet ou uma instabilidade passageira. Nada foi perdido.
      </p>
      <button type="button" onClick={() => unstable_retry()} className="adm-btn mt-5">
        <IconRetry className="h-4 w-4" />
        Tentar de novo
      </button>
    </div>
  );
}
