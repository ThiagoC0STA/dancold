// Define a senha dos admins do painel. A senha é digitada aqui, no terminal,
// e vai direto para o Supabase: não fica em arquivo nem em histórico.
//
//   node scripts/senha-admin.mjs                 (todos os admins)
//   node scripts/senha-admin.mjs fulano@x.com    (só um)
//
// Usa a CLI do Supabase já logada nesta máquina para pegar a chave de serviço.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const url = /^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m.exec(env)?.[1].trim();
if (!url) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL no .env.local.");
  process.exit(1);
}
const ref = new URL(url).hostname.split(".")[0];

const keys = JSON.parse(
  execSync(`supabase projects api-keys --project-ref ${ref} -o json`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const secret = keys.find((key) => key.name === "service_role")?.api_key;
if (!secret) {
  console.error("Não consegui a chave de serviço pela CLI do Supabase.");
  process.exit(1);
}
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };

async function call(method, route, body) {
  const response = await fetch(`${url}${route}`, { method, headers, body: body && JSON.stringify(body) });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

/** Pergunta sem mostrar o que é digitado. */
function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) process.stdout.write(question);
    };
  });
}

const only = process.argv[2]?.toLowerCase();
const admins = new Set((await call("GET", "/rest/v1/admins?select=user_id")).map((row) => row.user_id));
const users = (await call("GET", "/auth/v1/admin/users?per_page=200")).users.filter(
  (user) => admins.has(user.id) && (!only || user.email === only),
);
if (users.length === 0) {
  console.error("Nenhum admin encontrado.");
  process.exit(1);
}

console.log(`Admins: ${users.map((user) => user.email).join(", ")}`);
const password = await ask("Senha nova (não aparece ao digitar): ");
if (password.length < 10) {
  console.error("Use pelo menos 10 caracteres.");
  process.exit(1);
}
if ((await ask("Repita a senha: ")) !== password) {
  console.error("As duas não bateram. Nada foi alterado.");
  process.exit(1);
}

for (const user of users) {
  await call("PUT", `/auth/v1/admin/users/${user.id}`, { password });
  console.log(`Senha definida para ${user.email}`);
}
