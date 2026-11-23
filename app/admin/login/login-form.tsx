"use client";

import { useActionState, useState } from "react";
import { IconEye, IconEyeOff } from "@/components/admin/icons";
import { signIn } from "../actions";

export function LoginForm({ notice }: { notice: string | null }) {
  const [error, action, pending] = useActionState(signIn, notice);
  const [visible, setVisible] = useState(false);
  // controlado: o React limpa o formulário depois de enviar, e quem errou a senha
  // não precisa digitar o e-mail de novo
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="adm-label">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          autoFocus
          className="adm-input h-11"
        />
      </div>
      <div>
        <label htmlFor="password" className="adm-label">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            className="adm-input h-11 pr-12"
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Esconder a senha" : "Mostrar a senha"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink-3 transition-colors hover:text-ink"
          >
            {visible ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
      </div>
      <p role="alert" className="text-sm font-medium text-accent empty:hidden">
        {error}
      </p>
      <button type="submit" disabled={pending} className="adm-btn adm-btn-primary h-11 w-full">
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
