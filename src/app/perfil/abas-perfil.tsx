"use client";

import Link from "next/link";
import { useState } from "react";

type Transacao = {
  id: string;
  tipo: string;
  quantidade: number;
  descricao: string;
  origem: string;
  criadoEm: Date;
};

type Props = {
  nome: string;
  email: string;
  telefone: string | null;
  codigoIndicacao: string;
  saldoPontos: number;
  totalSemanasCadastradas: number;
  tipo: string;
  transacoes: Transacao[];
};

function progressoDiariaBonus(total: number) {
  if (total <= 0) return { atual: 0, texto: "Deposite semanas para avançar rumo à diária bônus a cada 10." };
  const r = total % 10;
  const atual = r === 0 ? 10 : r;
  if (r === 0) {
    return {
      atual: 10,
      texto: "Você atingiu um marco de 10 semanas. Se ainda não recebeu e-mail, o admin pode estar atribuindo sua diária bônus.",
    };
  }
  return {
    atual,
    texto: `Faltam ${10 - atual} semana(s) depositada(s) para o próximo marco de diária bônus.`,
  };
}

export function AbasPerfil({
  nome,
  email,
  telefone,
  codigoIndicacao,
  saldoPontos,
  totalSemanasCadastradas,
  tipo,
  transacoes,
}: Props) {
  const [aba, setAba] = useState<"conta" | "pontos">("pontos");
  const bonus = progressoDiariaBonus(totalSemanasCadastradas);
  const mostrarBarraBonus =
    tipo === "proprietario" || totalSemanasCadastradas > 0;

  return (
    <div>
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setAba("pontos")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${
            aba === "pontos"
              ? "border-[#1A56DB] text-[#1A56DB]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Meus pontos
        </button>
        <button
          type="button"
          onClick={() => setAba("conta")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${
            aba === "conta"
              ? "border-[#1A56DB] text-[#1A56DB]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Minha conta
        </button>
      </div>

      {aba === "pontos" && (
        <div className="space-y-6">
          {mostrarBarraBonus ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/90 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                    Diária bônus (proprietários)
                  </p>
                  <p className="text-2xl font-bold text-amber-950 tabular-nums mt-1">
                    {bonus.atual} <span className="text-base font-semibold text-amber-800">de 10</span>{" "}
                    semanas no ciclo atual
                  </p>
                </div>
                <Link
                  href="/indicar"
                  className="text-sm font-medium text-[#1A56DB] hover:underline shrink-0"
                >
                  Indicar amigos
                </Link>
              </div>
              <div className="h-2 rounded-full bg-amber-200/80 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-amber-500 transition-[width]"
                  style={{ width: `${(bonus.atual / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-amber-900/90">{bonus.texto}</p>
            </div>
          ) : null}

          <div className="rounded-2xl bg-[#1A56DB] text-white p-6 shadow-sm">
            <p className="text-blue-100 text-sm mb-1">Saldo atual</p>
            <p className="text-4xl font-bold tabular-nums">
              {saldoPontos.toLocaleString("pt-BR")}
            </p>
            <p className="text-blue-200 text-sm mt-1">pontos Switch</p>
            <p className="text-blue-200/90 text-xs mt-3">
              Conversão de referência: 10 pontos ≈ R$ 1,00 na plataforma.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Extrato</h2>
              <span className="text-xs text-gray-400">
                Mais recentes primeiro
              </span>
            </div>
            {transacoes.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center bg-white rounded-xl border border-gray-100">
                Nenhuma movimentação ainda. Deposite uma semana ou compre pontos.
              </p>
            ) : (
              <ul className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {transacoes.map((t) => (
                  <li
                    key={t.id}
                    className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800">{t.descricao}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(t.criadoEm).toLocaleString("pt-BR")} ·{" "}
                        <span className="capitalize">{t.origem.replace(/_/g, " ")}</span>
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold tabular-nums shrink-0 ${
                        t.tipo === "entrada" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.tipo === "entrada" ? "+" : "−"}
                      {t.quantidade.toLocaleString("pt-BR")} pts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {aba === "conta" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
              Nome
            </p>
            <p className="text-gray-900 font-medium">{nome}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
              E-mail
            </p>
            <p className="text-gray-900">{email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
              Telefone
            </p>
            <p className="text-gray-900">{telefone ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
              Código de indicação
            </p>
            <p className="text-gray-900 font-mono font-semibold">{codigoIndicacao}</p>
          </div>
        </div>
      )}
    </div>
  );
}
