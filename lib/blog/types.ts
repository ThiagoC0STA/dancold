import type { PortableTextBlock } from "@portabletext/react";

export type BlogPostCard = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  coverAlt: string;
  publishedAt: string;
};

export type BlogPost = BlogPostCard & {
  body: PortableTextBlock[];
};
