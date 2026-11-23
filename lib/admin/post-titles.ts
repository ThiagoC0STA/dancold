import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { PostTitles } from "./format";

/** Títulos dos posts por endereço, para mostrar "Blog › Título" em vez do endereço. */
export const getPostTitles = cache(async (): Promise<PostTitles> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("slug,title");
  if (error) return {};
  const titles: PostTitles = {};
  for (const post of data ?? []) {
    const title = (post.title as Record<string, string> | null)?.pt;
    if (title) titles[post.slug as string] = title;
  }
  return titles;
});
