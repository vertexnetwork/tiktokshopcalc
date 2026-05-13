#!/usr/bin/env tsx
/**
 * Generates content/pseo/<slug>.mdx for each category. v1 ships the prose
 * inline in app/(site)/tiktok-shop-fees/[slug]/page.tsx — these MDX files are
 * a placeholder layer for future hand-authored long-form content.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIES } from "../lib/categories";

const OUT_DIR = join(process.cwd(), "content", "pseo");
mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
for (const c of CATEGORIES) {
  const file = join(OUT_DIR, `${c.slug}.mdx`);
  if (existsSync(file)) continue;
  const body = `---
slug: ${c.slug}
title: ${c.title} on TikTok Shop
description: ${c.hookAngle}
category: ${c.l1}
related: ${JSON.stringify(c.related)}
publishedAt: "2026-05-12"
---

${c.hookAngle}

The page itself renders dynamically in \`app/(site)/tiktok-shop-fees/[slug]/page.tsx\` —
this MDX file is reserved for future hand-authored long-form copy specific to
${c.title.toLowerCase()}.
`;
  writeFileSync(file, body);
  written++;
}

console.log(`[pseo] generated ${written} files (skipped ${CATEGORIES.length - written} existing)`);
