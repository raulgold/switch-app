"use client";

import { useActionState } from "react";
import { depositarSemana, type DepositarState } from "./actions";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type Props = {
  defaults: {
    nome: string;
    email: string;
    telefone: string | null;
  };
};

export function DepositarFormulario({ defaults }: Props) {
  const initial: DepositarState = {};
  const [state, formAction, pending] = useActionState(depositarSemana, initial);

  return (
    <form action={formAction} className="space-y-6">
      {state.erro && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3"
          role="alert"
        >
          {state.erro}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Resort e local</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="nomeResort">
            Nome do resort / empreendimento
          </label>
          <input
            id="nomeResort"
            name="nomeResort"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Thermas Paradise"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="endereco">
            Endereço
          </label>
          <input
            id="endereco"
            name="endereco"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rua, número, bairro"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="cidade">
              Cidade
            </label>
            <input
              id="cidade"
              name="cidade"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="estado">
              UF
            </label>
            <select
              id="estado"
              name="estado"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Selecione
              </option>
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Período e unidade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="checkin">
              Check-in
            </label>
            <input
              id="checkin"
              name="checkin"
              type="date"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="checkout">
              Check-out
            </label>
            <input
              id="checkout"
              name="checkout"
              type="date"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="tipoApartamento">
            Tipo de apartamento
          </label>
          <input
            id="tipoApartamento"
            name="tipoApartamento"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 2 quartos, vista piscina"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="capacidade">
            Capacidade (hóspedes)
          </label>
          <input
            id="capacidade"
            name="capacidade"
            type="number"
            min={1}
            defaultValue={4}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Pontos</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="pontosSemana">
            Pontos pedidos (semana completa)
          </label>
          <input
            id="pontosSemana"
            name="pontosSemana"
            type="number"
            min={1}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            placeholder="Ex: 5000"
          />
          <p className="text-xs text-gray-400 mt-1">
            A diária em pontos será calculada com base no número de noites.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Fotos</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="fotos">
            URLs das fotos (uma por linha)
          </label>
          <textarea
            id="fotos"
            name="fotos"
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            placeholder="https://...&#10;https://..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Use links públicos (por enquanto sem upload). Deixe em branco se ainda não tiver imagens.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="observacoes">
            Observações (opcional)
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Regras do resort, diferenciais..."
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Contato na listagem</h2>
        <p className="text-xs text-gray-500">
          Esses dados aparecem para interessados. Por padrão usamos seu cadastro.
        </p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="contatoNome">
            Nome
          </label>
          <input
            id="contatoNome"
            name="contatoNome"
            defaultValue={defaults.nome}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="contatoEmail">
            E-mail
          </label>
          <input
            id="contatoEmail"
            name="contatoEmail"
            type="email"
            defaultValue={defaults.email}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="contatoTel">
            Telefone / WhatsApp
          </label>
          <input
            id="contatoTel"
            name="contatoTel"
            type="tel"
            defaultValue={defaults.telefone ?? ""}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(00) 00000-0000"
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Publicar semana"}
        </button>
      </div>
    </form>
  );
}
