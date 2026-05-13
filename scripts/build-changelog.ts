#!/usr/bin/env tsx
/**
 * Builds content/changelog.json from `git log`. Idempotent. Skips when not in a
 * git repo (so the build doesn't fail on clean checkouts that haven't fetched
 * history). Title truncates to 80 chars per the network spec.
 */
import { execSync } from "node:child_process";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

interface Entry {
  date: string;
  title: string;
}

const OUT = join(process.cwd(), "content", "changelog.json");

function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function build(): Entry[] {
  if (!isGitRepo()) return [];
  try {
    const raw = execSync(`git log --pretty=format:'%ad|%s' --date=short`, {
      encoding: "utf8",
    }).trim();
    if (!raw) return [];
    return raw
      .split("\n")
      .map((line) => {
        const idx = line.indexOf("|");
        if (idx === -1) return null;
        const date = line.slice(0, idx).replace(/^'/, "").trim();
        const title = line.slice(idx + 1).replace(/'$/, "").trim().slice(0, 80);
        return { date, title };
      })
      .filter((e): e is Entry => e !== null && !!e.date && !!e.title)
      .filter((e) => !e.title.toLowerCase().startsWith("merge "))
      .filter((e) => !e.title.toLowerCase().startsWith("wip"));
  } catch {
    return [];
  }
}

const entries = build();
const dir = dirname(OUT);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

if (entries.length === 0) {
  // Preserve any seeded entries — only overwrite if we have git data.
  if (!existsSync(OUT)) writeFileSync(OUT, JSON.stringify([], null, 2));
  console.log("[changelog] no git data; keeping existing entries");
} else {
  writeFileSync(OUT, JSON.stringify(entries, null, 2));
  console.log(`[changelog] wrote ${entries.length} entries`);
}
