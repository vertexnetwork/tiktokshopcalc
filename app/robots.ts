import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import aiBots from "@/public/ai-bots.json";

interface AiBotsConfig {
  version: string;
  allow: string[];
  disallow: string[];
}

export default function robots(): MetadataRoute.Robots {
  const cfg = aiBots as AiBotsConfig;
  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/" },
  ];
  for (const bot of cfg.allow || []) {
    rules.push({ userAgent: bot, allow: "/" });
  }
  for (const bot of cfg.disallow || []) {
    rules.push({ userAgent: bot, disallow: "/" });
  }
  return {
    rules,
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
