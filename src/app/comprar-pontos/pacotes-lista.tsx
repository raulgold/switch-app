"use client";

import Link from "next/link";

export type Pacote = {
  id: string;
  pontos: number;
  precoCentavos: number;
  rotulo: string;
};

function formatBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PacotesLista({
  pacotes,
  logado,
}: {
  pacotes: Pacote[];
  logado: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pacotes.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col"
        >
          <span className="text-xs font-semibold text-[#1A56DB] uppercase tracking-wide">
            {p.rotulo}
          </span>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {p.pontos.toLocaleString("pt-BR")} pts
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {formatBRL(p.precoCentavos)}
          </p>
          <p className="text-xs text-gray-400 mt-3 flex-1">
            Checkout Asaas (sandbox/produção) será ligado aqui na próxima etapa do guia.
          </p>
          {logado ? (
            <button
              type="button"
              disabled
              className="mt-4 w-full py-3 rounded-xl bg-gray-200 text-gray-500 text-sm font-semibold cursor-not-allowed"
            >
              Pagar — em breve
            </button>
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/comprar-pontos")}`}
              className="mt-4 block w-full text-center py-3 rounded-xl bg-[#1A56DB] text-white text-sm font-semibold hover:bg-[#1447be] transition"
            >
              Entrar para comprar
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
