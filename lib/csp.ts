/**
 * Content Security Policy builder. Per-provider toggles drive the script/connect
 * directives. The /embed/* route overrides frame-ancestors to allow iframing.
 */

export interface CSPProviders {
  vercelAnalytics?: boolean;
  adsense?: boolean;
  mediavine?: boolean;
  carbon?: boolean;
  clarity?: boolean;
  plausible?: boolean;
}

export function buildCSP(providers: CSPProviders = {}): string {
  const script = ["'self'", "'unsafe-inline'"];
  const connect = ["'self'"];
  const img = ["'self'", "data:", "blob:", "https:"];
  const style = ["'self'", "'unsafe-inline'"];
  const font = ["'self'", "data:"];
  const frame = ["'self'"];

  if (providers.vercelAnalytics) {
    script.push("https://va.vercel-scripts.com");
    connect.push("https://vitals.vercel-insights.com", "https://vercel-vitals.axiom.co");
  }
  if (providers.adsense) {
    script.push(
      "https://pagead2.googlesyndication.com",
      "https://googleads.g.doubleclick.net",
      "https://www.google.com",
      "https://www.gstatic.com",
    );
    frame.push("https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com");
    img.push("https://*.googlesyndication.com");
  }
  if (providers.mediavine) {
    script.push("https://scripts.mediavine.com", "https://ads.mediavine.com");
    connect.push("https://scripts.mediavine.com");
    img.push("https://*.mediavine.com");
  }
  if (providers.carbon) {
    script.push("https://cdn.carbonads.com", "https://srv.carbonads.net");
    img.push("https://srv.carbonads.net", "https://ad.doubleclick.net");
  }
  if (providers.clarity) {
    script.push("https://www.clarity.ms", "https://*.clarity.ms");
    connect.push("https://*.clarity.ms");
  }
  if (providers.plausible) {
    script.push("https://plausible.io", "https://*.plausible.io");
    connect.push("https://plausible.io", "https://*.plausible.io");
  }

  return [
    `default-src 'self'`,
    `script-src ${script.join(" ")}`,
    `connect-src ${connect.join(" ")}`,
    `style-src ${style.join(" ")}`,
    `img-src ${img.join(" ")}`,
    `font-src ${font.join(" ")}`,
    `frame-src ${frame.join(" ")}`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}
