import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./env";

/** Cliente do navegador, só para o admin enviar imagem direto ao Storage. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
