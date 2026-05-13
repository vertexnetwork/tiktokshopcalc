import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { CATEGORIES } from "@/lib/categories";

// Priority hierarchy: home > category index > top-of-funnel landing pages >
// transactional pages > legal. Crawlers use this to budget recrawls — a flat
// 0.7 everywhere wastes that signal.
const STATIC_ROUTES: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFreq: "weekly" },
  { path: "/tiktok-shop-fees", priority: 0.9, changeFreq: "weekly" },
  { path: "/pricing", priority: 0.7, changeFreq: "monthly" },
  { path: "/embed", priority: 0.7, changeFreq: "monthly" },
  { path: "/about", priority: 0.5, changeFreq: "monthly" },
  { path: "/network", priority: 0.5, changeFreq: "monthly" },
  { path: "/changelog", priority: 0.4, changeFreq: "weekly" },
  { path: "/contact", priority: 0.3, changeFreq: "yearly" },
  { path: "/privacy", priority: 0.2, changeFreq: "yearly" },
  { path: "/terms", priority: 0.2, changeFreq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastmod = process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE
    ? new Date(process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE)
    : new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified: lastmod,
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));

  const pseoEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${siteConfig.url}/tiktok-shop-fees/${c.slug}`,
    lastModified: lastmod,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...pseoEntries];
}
