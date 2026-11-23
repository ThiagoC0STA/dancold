/**
 * Planilha .csv que o Excel em português abre certo: ponto e vírgula como
 * separador e BOM no começo para os acentos (sem o BOM o Excel lê como ANSI).
 */

const FORMULA = /^[=+\-@\t\r]/;
const PHONE = /^\+[\d\s().-]+$/;

/** Uma célula: aspas quando precisa, e nunca vira fórmula no Excel. */
function cell(value: unknown, separator: string, guard: boolean): string {
  if (value === null || value === undefined) return "";
  let text = String(value).replace(/\r\n?/g, "\n");
  if (guard && FORMULA.test(text)) {
    // telefone "+55 ..." com espaço na frente continua telefone; o resto ganha apóstrofo
    text = PHONE.test(text) ? ` ${text}` : `'${text}`;
  }
  return /["\n]/.test(text) || text.includes(separator) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(
  header: string[],
  rows: unknown[][],
  {
    separator = ";",
    bom = true,
    guard = true,
  }: {
    separator?: string;
    bom?: boolean;
    /** false só para arquivo que vai para outro sistema (Google Ads), onde o apóstrofo estragaria o código */
    guard?: boolean;
  } = {},
): string {
  const lines = [header, ...rows].map((row) => row.map((value) => cell(value, separator, guard)).join(separator));
  return `${bom ? "﻿" : ""}${lines.join("\r\n")}\r\n`;
}

/** Resposta de download com nome de arquivo e sem cache. */
export function csvResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

const dayFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" });
const dateTimeFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** "2026-11-23", no horário de Brasília: vai no nome do arquivo. */
export const today = () => dayFormat.format(new Date());

/** "2026-11-23 14:05:09", no horário de Brasília. */
export const localDateTime = (iso: string) => dateTimeFormat.format(new Date(iso)).replace(",", "");
