import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PainelReserva } from "./painel-reserva";

const AVISO_RESERVA =
  "Reservas pagas têm prioridade. Nenhuma reserva garante hospedagem antes da confirmação do resort (até 7 dias úteis).";

export default async function SemanaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const semana = await prisma.semana.findUnique({
    where: { id },
  });

  if (!semana) {
    notFound();
  }

  const media = Number(semana.avaliacaoMedia);
  const estrelasArredondadas = Math.min(5, Math.max(0, Math.round(media)));

  const logado = Boolean(session?.user?.id);
  const ehProprietario =
    logado && session!.user!.id === semana.proprietarioId;
  const disponivel = semana.status === "disponivel";

  let podeReservar = disponivel && !ehProprietario;
  let motivoBloqueio: string | undefined;
  if (ehProprietario) {
    motivoBloqueio = "Esta semana é sua — você não pode reservar o próprio anúncio.";
    podeReservar = false;
  } else if (!disponivel) {
    motivoBloqueio = `Esta semana não está disponível no momento (status: ${semana.status}).`;
    podeReservar = false;
  }

  const fotos =
    semana.fotos.length > 0 ? semana.fotos : [null as string | null];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-[#1A56DB] shrink-0">
            SWITCH
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/semanas"
              className="text-gray-600 hover:text-[#1A56DB] whitespace-nowrap"
            >
              ← Semanas
            </Link>
            {logado ? (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-[#1A56DB] hidden sm:inline"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-[#1A56DB] font-medium whitespace-nowrap"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {semana.isFake && (
            <span className="inline-flex items-center rounded-full bg-orange-500 text-white text-xs font-bold px-3 py-1">
              DEMONSTRAÇÃO
            </span>
          )}
          {semana.isSemanaOuro && (
            <span className="inline-flex items-center rounded-full bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1">
              SEMANA OURO — 30% OFF nos pontos
            </span>
          )}
          {semana.destaqueEncalhada && (
            <span className="inline-flex items-center rounded-full bg-blue-100 text-[#1A56DB] text-xs font-semibold px-3 py-1">
              Semana encalhada em destaque
            </span>
          )}
        </div>

        {/* Galeria horizontal */}
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin mb-8 -mx-1 px-1">
          {fotos.map((url, i) => (
            <div
              key={url ?? `ph-${i}`}
              className="min-w-[85%] sm:min-w-[420px] h-56 sm:h-72 rounded-2xl overflow-hidden snap-center shrink-0 bg-gradient-to-br from-blue-100 to-blue-50 border border-gray-100"
            >
              {url ? (
                <img
                  src={url}
                  alt={`${semana.nomeResort} — foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  🏖️
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {semana.nomeResort}
              </h1>
              <p className="text-gray-500 mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  📍 {semana.cidade}, {semana.estado}
                  {semana.pais && semana.pais !== "Brasil"
                    ? ` — ${semana.pais}`
                    : ""}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{semana.endereco}</p>
            </div>

            {media > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 text-xl" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < estrelasArredondadas ? (
                      <span key={i}>★</span>
                    ) : (
                      <span key={i} className="text-gray-200">
                        ★
                      </span>
                    )
                  )}
                </div>
                <span className="text-gray-700 font-medium">
                  {media.toFixed(1)}
                </span>
                <span className="text-gray-400 text-sm">
                  ({semana.totalAvaliacoes}{" "}
                  {semana.totalAvaliacoes === 1 ? "avaliação" : "avaliações"})
                </span>
              </div>
            )}

            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-950">
              <strong className="font-semibold">Importante:</strong> {AVISO_RESERVA}
            </div>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Período e unidade
              </h2>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>
                  <strong className="text-gray-800">Check-in:</strong>{" "}
                  {new Date(semana.checkin).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </li>
                <li>
                  <strong className="text-gray-800">Check-out:</strong>{" "}
                  {new Date(semana.checkout).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </li>
                <li>
                  <strong className="text-gray-800">Apartamento:</strong>{" "}
                  {semana.tipoApartamento}
                </li>
                <li>
                  <strong className="text-gray-800">Capacidade:</strong> até{" "}
                  {semana.capacidade}{" "}
                  {semana.capacidade === 1 ? "pessoa" : "pessoas"}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Descrição e comodidades
              </h2>
              {semana.observacoes ? (
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {semana.observacoes}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  O anunciante não adicionou descrição detalhada.
                </p>
              )}
            </section>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <PainelReserva
              semanaId={semana.id}
              pontosSemana={semana.pontosSemana}
              pontosDiaria={semana.pontosDiaria}
              isOuro={semana.isSemanaOuro}
              logado={logado}
              podeReservar={podeReservar}
              motivoBloqueio={motivoBloqueio}
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-2">Contato</h3>
              <p>{semana.contatoProprietarioNome}</p>
              <p className="mt-1">
                <a
                  href={`mailto:${semana.contatoProprietarioEmail}`}
                  className="text-[#1A56DB] hover:underline"
                >
                  {semana.contatoProprietarioEmail}
                </a>
              </p>
              <p className="mt-1">
                {(() => {
                  const digits = semana.contatoProprietarioTel.replace(/\D/g, "");
                  if (!digits) {
                    return <span>{semana.contatoProprietarioTel}</span>;
                  }
                  return (
                    <a
                      href={`tel:${digits}`}
                      className="text-[#1A56DB] hover:underline"
                    >
                      {semana.contatoProprietarioTel}
                    </a>
                  );
                })()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
