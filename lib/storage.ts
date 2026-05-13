/**
 * Versioned localStorage wrapper. Storage keys are namespaced under
 * `${siteConfig.shortName}-...` to avoid colliding with sibling spokes.
 */

import { siteConfig } from "./site-config";

const PREFIX = `${siteConfig.shortName}`;

function key(name: string): string {
  return `${PREFIX}-${name}`;
}

export function readJSON<T>(name: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(name));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJSON(name: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // quota errors are non-fatal
  }
}

export function remove(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(name));
  } catch {
    // non-fatal
  }
}
