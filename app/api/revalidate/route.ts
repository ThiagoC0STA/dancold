import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Called by the Sanity webhook on publish/unpublish so new posts appear
 * immediately without a redeploy. Configure the webhook URL as:
 * https://<site>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const provided = new URL(request.url).searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Segredo inválido." }, { status: 401 });
  }

  revalidateTag("blog", "max");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
