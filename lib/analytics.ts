/**
 * Defensive analytics wrapper. Routes events through whatever provider is wired
 * up (Vercel Analytics by default). Never throws even when the provider is missing.
 */

type EventProps = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    va?: (event: string, name?: string, props?: EventProps) => void;
    plausible?: (event: string, opts?: { props?: EventProps }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function safeTrack(event: string, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.va === "function") {
      window.va("event", event, props);
    }
    if (typeof window.plausible === "function") {
      window.plausible(event, { props });
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", event, props);
    }
  } catch {
    // never throw from analytics
  }
}
