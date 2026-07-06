import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder, { type SanityImageSource } from "@sanity/image-url";
import { apiVersion, dataset, projectId } from "../env";

// Lazily created so importing this module never throws when Sanity isn't
// configured yet (empty projectId → sample-post mode).
let cachedClient: SanityClient | null = null;
let cachedBuilder: ReturnType<typeof imageUrlBuilder> | null = null;

export function getClient(): SanityClient {
  if (!cachedClient) {
    cachedClient = createClient({
      projectId,
      dataset,
      apiVersion,
      // CDN off so revalidateTag("blog") always serves fresh content after publish.
      useCdn: false,
      token: process.env.SANITY_API_READ_TOKEN,
      perspective: "published",
    });
  }
  return cachedClient;
}

export function imageUrl(source: SanityImageSource, width = 1200): string {
  if (!cachedBuilder) cachedBuilder = imageUrlBuilder({ projectId, dataset });
  return cachedBuilder.image(source).width(width).fit("max").auto("format").url();
}
