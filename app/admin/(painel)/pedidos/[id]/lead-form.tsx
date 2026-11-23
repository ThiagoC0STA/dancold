"use client";

import { useActionState, useState } from "react";
import { LEAD_STATUS } from "@/lib/admin/format";
import { updateLead } from "../../../actions";

export function LeadForm({ id, status, notes }: { id: string; status: string; notes: string }) {
  const [message, action, pending] = useActionState(updateLead, null);
  const [current, setCurrent] = useState(status);

  return (
    <form action={action} className="px-5 pb-5">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={current} />

      <span className="adm-label" id="lead-status">
        Situação
      </span>
      <div className="mt-2">
        {/* no celular as quatro situações ficam em 2 x 2, sem cortar na borda */}
        <div className="adm-seg adm-seg-fill" role="group" aria-labelledby="lead-status">
          {Object.entries(LEAD_STATUS).map(([value, info]) => (
            <button
              key={value}
              type="button"
              aria-pressed={current === value}
              onClick={() => setCurrent(value)}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="lead-notes" className="adm-label mt-5">
        Anotações
      </label>
      <textarea
        id="lead-notes"
        name="notes"
        rows={5}
        maxLength={4000}
        defaultValue={notes}
        placeholder="Quem atendeu, o que foi combinado, valor da proposta..."
        className="adm-input resize-y"
      />

      <div className="mt-4 flex items-center gap-4">
        <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <p role="status" className="text-[13px] text-ink-2">
          {!pending && message}
        </p>
      </div>
    </form>
  );
}
