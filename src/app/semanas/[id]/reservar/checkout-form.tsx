"use client";

import { useActionState, useEffect, useState } from "react";
import { checkoutReserva, type CheckoutState } from "./actions";
import { TEXTO_TERMOS_RESERVA } from "@/lib/termos-reserva";

type Props = {
  semanaId: string;
  nomeResort: string;
  tipo: "semana" | "diaria";
  pontosNecessarios: number;
  pontosOriginais: number | null;
  saldoAtual: number;
  taxaPrioridade: number;
  minDiariaISO: string;
  maxDiariaISO: string;
};

export function CheckoutFormulario({
  semanaId,
  nomeResort,
  tipo,
  pontosNecessarios,
  pontosOriginais,
  saldoAtual,
  taxaPrioridade,
  minDiariaISO,
  maxDiariaISO,
}: Props) {
  const [state, formAction, pending] = useActionState(checkoutReserva, undefined);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    if (state && "ok" in state && state.ok && state.invoiceUrl) {
      window.location.href = state.invoiceUrl;
    }
  }, [state]);

  const tipoReserva = tipo === "diaria" ? "diaria" : "semana_completa";
  const saldoOk = saldoAtual >= pontosNecessarios;

  return (
    <>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="semanaId" value={semanaId} />
        <input type="hidden" name="tipo" value={tipoReserva} />

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p>
            <strong>Resort:</strong> {nomeResort}
          </p>
          <p className="mt-1">
            <strong>Modalidade:</strong>{" "}
            {tipo === "diaria" ? "Diária" : "Semana completa"}
          </p>
          <p className="mt-1">
            <strong>Pontos necessários:</strong>{" "}
            {pontosOriginais != null && pontosOriginais !== pontosNecessarios ? (
              <>
                <span className="line-through text-gray-400 mr-1">
                  {pontosOriginais.toLocaleString("pt-BR")}
                </span>
              </>
            ) : null}
            <span className="text-[#1A56DB] font-bold">
              {pontosNecessarios.toLocaleString("pt-BR")} pts
            </span>
          </p>
          <p className="mt-1">
            <strong>Seu saldo:</strong>{" "}
            <span className={saldoOk ? "text-green-700" : "text-red-600"}>
              {saldoAtual.toLocaleString("pt-BR")} pts
            </span>
            {!saldoOk && (
              <span className="block text-red-600 text-xs mt-1">
                Saldo insuficiente — compre pontos ou escolha outra semana.
              </span>
            )}
          </p>
        </div>

        {tipo === "diaria" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="dataDiaria">
              Data da diária
            </label>
            <input
              id="dataDiaria"
              name="dataDiaria"
              type="date"
              required
              min={minDiariaISO}
              max={maxDiariaISO}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Escolha um dia entre check-in e check-out do anúncio.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-start gap-3">
          <input
            id="aceitoTermos"
            name="aceitoTermos"
            type="checkbox"
            required
            className="mt-1 rounded border-gray-300"
          />
          <label htmlFor="aceitoTermos" className="text-sm text-gray-700">
            Li e aceito os{" "}
            <button
              type="button"
              className="text-[#1A56DB] font-medium underline"
              onClick={() => setModalAberto(true)}
            >
              Termos de Reserva
            </button>
            .
          </label>
        </div>

        {state != null && "erro" in state && state.erro && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {state.erro}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            name="intencao"
            value="gratis"
            disabled={pending || !saldoOk}
            className="flex-1 py-3.5 rounded-xl border-2 border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {pending ? "Processando…" : "Reservar gratuitamente (fila)"}
          </button>
          <button
            type="submit"
            name="intencao"
            value="prioridade"
            disabled={pending || !saldoOk}
            className="flex-1 py-3.5 rounded-xl bg-[#1A56DB] text-white font-semibold hover:bg-[#1447be] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {pending
              ? "Gerando cobrança…"
              : `Reservar com prioridade — R$ ${taxaPrioridade.toFixed(2).replace(".", ",")}`}
          </button>
        </div>

        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Reservas pagas têm prioridade na fila. Nenhuma reserva garante hospedagem
          antes da confirmação do resort (até 7 dias úteis). A taxa de prioridade não
          é reembolsável após o processamento.
        </p>
      </form>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="termos-titulo"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 id="termos-titulo" className="font-bold text-gray-900">
                Termos de Reserva
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-800 text-xl leading-none px-2"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
              {TEXTO_TERMOS_RESERVA}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
                className="w-full py-3 rounded-xl bg-[#1A56DB] text-white font-semibold"
                onClick={() => setModalAberto(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
