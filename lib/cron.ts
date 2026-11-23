import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Rotas de cron da Vercel (vercel.json): a Vercel manda sozinha
 * `Authorization: Bearer <CRON_SECRET>`. Sem o segredo (16+ caracteres) nada roda.
 */
const SECRET = process.env.CRON_SECRET?.trim() ?? "";

export function isCronAuthorized(request: Request): boolean {
  if (SECRET.length < 16) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${SECRET}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const cronJson = (body: object, status = 200): Response =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
