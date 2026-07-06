export const apiVersion = "2026-07-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

/**
 * The blog works in two modes: with Sanity configured (real content) or,
 * while the account/keys don't exist yet, with local sample posts so the
 * pages can be built and reviewed.
 */
export const isSanityConfigured = projectId.length > 0;
