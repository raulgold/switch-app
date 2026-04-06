"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Modo = "semana" | "diaria";

type Props = {
  semanaId: string;
  pontosSemana: number;
  pontosDiaria: number;
  isOuro: boolean;
  logado: boolean;
  podeReservar: boolean;
  motivoBloqueio?: string;
};

function comDescontoOuro(pontos: number, ouro: boolean) {
  if (!ouro) return { final: pontos, original: null as number | null };
  const final = Math.max(1, Math.round(pontos * 0.7));
  return { final, original: pontos };
}

export function PainelReserva({
  semanaId,
  pontosSemana,
  pontosDiaria,
  isOuro,
  logado,
  podeReservar,
  motivoBloqueio,
}: Props) {
  const [modo, setModo] = useState<Modo>("semana");

  const base = modo === "semana" ? pontosSemana : pontosDiaria;
  const { final, original } = useMemo(
    () => comDescontoOuro(base, isOuro),
    [base, isOuro]
  );

  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/semanas/${semanaId}/reservar`)}`;
  const reservarHref = `/semanas/${semanaId}/reservar?tipo=${modo}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        Pontos Switch
      </p>

      <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
        <button
          type="button"
          onClick={() => setModo("semana")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            modo === "semana"
              ? "bg-white text-[#1A56DB] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Semana completa
        </button>
        <button
          type="button"
          onClick={() => setModo("diaria")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            modo === "diaria"
              ? "bg-white text-[#1A56DB] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Diária
        </button>
      </div>

      <div className="mb-6">
        {original != null && (
          <p className="text-sm text-gray-400 line-through mb-1">
            {original.toLocaleString("pt-BR")} pts
          </p>
        )}
        <p className="text-3xl font-bold text-[#1A56DB]">
          {final.toLocaleString("pt-BR")}{" "}
          <span className="text-lg font-semibold">pts</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {modo === "semana"
            ? "Uso da semana inteira no período anunciado"
            : "Por dia — escolha a data na próxima etapa"}
        </p>
      </div>

      {!podeReservar && motivoBloqueio && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
          {motivoBloqueio}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {!logado && (
          <Link
            href={loginHref}
            className="block w-full text-center bg-[#1A56DB] text-white font-semibold py-3.5 rounded-xl hover:bg-[#1447be] transition"
          >
            Entrar para reservar
          </Link>
        )}
        {logado && podeReservar && (
          <Link
            href={reservarHref}
            className="block w-full text-center bg-[#1A56DB] text-white font-semibold py-3.5 rounded-xl hover:bg-[#1447be] transition"
          >
            Reservar com pontos
          </Link>
        )}
        {logado && !podeReservar && (
          <span className="block w-full text-center bg-gray-200 text-gray-600 font-semibold py-3.5 rounded-xl cursor-not-allowed">
            Reserva indisponível
          </span>
        )}

        <Link
          href="/comprar-pontos"
          className="block w-full text-center border-2 border-[#1A56DB] text-[#1A56DB] font-semibold py-3 rounded-xl hover:bg-blue-50 transition"
        >
          Complementar com pontos
        </Link>
      </div>
    </div>
  );
}
