"use client";

import { useState } from "react";

export function CopiarLinkIndicacao({ linkCompleto }: { linkCompleto: string }) {
  const [ok, setOk] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(linkCompleto);
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch {
      setOk(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 break-all">
        {linkCompleto}
      </div>
      <button
        type="button"
        onClick={copiar}
        className="w-full sm:w-auto rounded-xl bg-[#1A56DB] text-white font-semibold px-6 py-3 hover:bg-[#1447be] transition"
      >
        {ok ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
