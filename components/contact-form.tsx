"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Dictionary } from "@/dictionaries";

type FormCopy = Dictionary["contact"]["form"];

const inputClass =
  "w-full rounded-md border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15";

const labelClass = "mb-2 block text-[13px] font-medium text-ink-2";

export function ContactForm({ copy, whatsappNumber }: { copy: FormCopy; whatsappNumber: string }) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = [
      `*${copy.name}:* ${data.get("name")}`,
      `*${copy.email}:* ${data.get("email")}`,
      `*${copy.phone}:* ${data.get("phone")}`,
      "",
      `${data.get("message")}`,
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>{copy.name}</span>
          <input name="name" required className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>{copy.email}</span>
          <input name="email" type="email" required className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>{copy.phone}</span>
        <input name="phone" type="tel" required className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>{copy.message}</span>
        <textarea name="message" required rows={6} className={`${inputClass} resize-none`} />
      </label>

      <button type="submit" className="btn btn-primary w-full cursor-pointer">
        {copy.submit}
        <span aria-hidden className="btn-arrow">→</span>
      </button>

      {status === "sent" && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          className="rounded-lg border border-emerald-600/25 bg-emerald-500/10 px-5 py-3.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"
        >
          {copy.success}
        </motion.p>
      )}
    </form>
  );
}
