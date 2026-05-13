/**
 * Loads the network.json registry that lists every spoke in the Vertex Network.
 * Synced from vertexnetwork/hub via the sync-from-hub.yml workflow.
 */
import { siteConfig } from "./site-config";

export interface NetworkSite {
  slug: string;
  name: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  audience: string;
  tags: string[];
  status: "live" | "soon";
}

export interface NetworkData {
  version: string;
  brand: string;
  sites: NetworkSite[];
}

let cached: NetworkData | null = null;

export async function loadNetwork(): Promise<NetworkData> {
  if (cached) return cached;
  try {
    const data = (await import("@/public/network.json")) as unknown as { default: NetworkData };
    cached = data.default ?? (data as unknown as NetworkData);
    return cached;
  } catch {
    cached = { version: "0", brand: "Vertex Network", sites: [] };
    return cached;
  }
}

export async function getSisterSites(): Promise<NetworkSite[]> {
  const data = await loadNetwork();
  return data.sites.filter((s) => s.url !== siteConfig.url);
}
