import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Until the static PNG icon set is generated, point only at the SVG mark
// that actually ships in app/icon.svg. Browsers that don't render SVG
// manifest icons fall back to the favicon — no broken-icon ghosts.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/?utm_source=pwa",
    display: "standalone",
    background_color: "#0A0A0F",
    theme_color: "#0A0A0F",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
