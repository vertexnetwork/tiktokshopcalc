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
  // Default-allow stance for the wildcard. Per-bot ALLOW entries are
  // redundant under that default, so we only emit per-bot rules when the
  // ai-bots manifest lists a bot in `disallow` — that's where the file
  // actually changes crawler behavior.
  const rules: MetadataRoute.Robots["rules"] = [{ userAgent: "*", allow: "/" }];
  for (const bot of cfg.disallow || []) {
    rules.push({ userAgent: bot, disallow: "/" });
  }
  return {
    rules,
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
