import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { CATEGORIES } from "@/lib/categories";

const STATIC_ROUTES = [
  "",
  "/about",
  "/changelog",
  "/contact",
  "/network",
  "/privacy",
  "/terms",
  "/pricing",
  "/embed",
  "/tiktok-shop-fees",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastmod = process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE
    ? new Date(process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE)
    : new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: lastmod,
    changeFrequency: "weekly",
    priority: p === "" ? 1.0 : 0.7,
  }));

  const pseoEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${siteConfig.url}/tiktok-shop-fees/${c.slug}`,
    lastModified: lastmod,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...pseoEntries];
}
