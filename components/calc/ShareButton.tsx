"use client";

import { useState } from "react";
import type { FeeInput } from "@/lib/fee-engine";
import { encodeShareState } from "@/lib/share";
import { safeTrack } from "@/lib/analytics";

interface Props {
  input: FeeInput;
}

export function ShareButton({ input }: Props) {
  const [copied, setCopied] = useState(false);

  function share() {
    const encoded = encodeShareState(input);
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        safeTrack("share_link_copied");
        setTimeout(() => setCopied(false), 1800);
      },
      () => setCopied(false),
    );
  }

  return (
    <button type="button" onClick={share} className="btn-ghost">
      {copied ? "✓ Copied!" : "Share this scenario"}
    </button>
  );
}
