"use client";

import { useActionState, useState } from "react";
import { IconEye, IconEyeOff } from "@/components/admin/icons";
import { changePassword } from "../../actions";

const FIELDS = [
  { name: "current", label: "Senha atual", autoComplete: "current-password" },
  { name: "next", label: "Senha nova", autoComplete: "new-password", hint: "Pelo menos 8 caracteres." },
  { name: "repeat", label: "Repita a senha nova", autoComplete: "new-password" },
];

export function PasswordForm() {
  const [result, action, pending] = useActionState(changePassword, null);
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="space-y-4 px-5 pb-5">
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={`pw-${field.name}`} className="adm-label">
            {field.label}
          </label>
          <input
            id={`pw-${field.name}`}
            name={field.name}
            type={visible ? "text" : "password"}
            autoComplete={field.autoComplete}
            required
            minLength={field.name === "current" ? undefined : 8}
            maxLength={72}
            className="adm-input h-11"
            aria-describedby={field.hint ? `pw-${field.name}-hint` : undefined}
          />
          {field.hint && (
            <p id={`pw-${field.name}-hint`} className="adm-hint mt-1.5">
              {field.hint}
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-pressed={visible}
        className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-2 hover:text-ink"
      >
        {visible ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
        {visible ? "Esconder as senhas" : "Mostrar as senhas"}
      </button>

      {result && (
        <p role="status" className={`text-[13.5px] font-medium ${result.ok ? "text-(--ok)" : "text-(--bad)"}`}>
          {result.message}
        </p>
      )}

      <div className="pt-2">
        <button type="submit" disabled={pending} className="adm-btn adm-btn-primary h-10">
          {pending ? "Trocando..." : "Trocar a senha"}
        </button>
      </div>
    </form>
  );
}
