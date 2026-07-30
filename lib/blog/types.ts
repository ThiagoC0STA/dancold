import type { PortableTextBlock } from "@portabletext/react";

export type BlogPostCard = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  coverAlt: string;
  /** "w / h" from the Sanity asset; lets the cover box match the image instead of cropping to 16:9. */
  coverRatio?: string;
  publishedAt: string;
};

export type BlogPost = BlogPostCard & {
  body: PortableTextBlock[];
};
