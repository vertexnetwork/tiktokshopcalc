"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

export function EmbedSnippet() {
  const [copied, setCopied] = useState(false);
  const snippet = `<iframe src="${siteConfig.url}/embed-iframe" title="${siteConfig.name}" style="width:100%;min-height:720px;border:0;border-radius:12px;" loading="lazy"></iframe>`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => setCopied(false),
    );
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <pre
        className="card"
        style={{
          padding: "1rem",
          overflow: "auto",
          fontSize: "0.8125rem",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          color: "var(--color-on-bg)",
          margin: 0,
        }}
      >
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="btn-primary"
        style={{ marginTop: "0.75rem" }}
      >
        {copied ? "Copied!" : "Copy iframe code"}
      </button>
    </div>
  );
}
