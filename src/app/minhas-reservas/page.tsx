import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusLabel: Record<string, string> = {
  em_fila: "Na fila",
  prioritaria: "Prioritária",
  em_analise: "Em análise",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

export default async function MinhasReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/minhas-reservas");
  }

  const sp = await searchParams;

  const reservas = await prisma.reserva.findMany({
    where: { clienteId: session.user.id },
    orderBy: { criadoEm: "desc" },
    include: { semana: true },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1A56DB]">
            SWITCH
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-[#1A56DB]">
              Dashboard
            </Link>
            <Link href="/perfil" className="text-gray-600 hover:text-[#1A56DB]">
              Perfil
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas reservas</h1>
        <p className="text-gray-500 text-sm mb-6">
          Acompanhe status, pontos utilizados e taxa de prioridade.
        </p>

        {sp.ok === "1" && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 text-green-800 text-sm px-4 py-3">
            Reserva registrada na fila com sucesso.
          </div>
        )}

        {reservas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm">
            Você ainda não tem reservas.{" "}
            <Link href="/semanas" className="text-[#1A56DB] font-medium">
              Explorar semanas
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {reservas.map((r) => (
              <li
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/semanas/${r.semanaId}`}
                      className="font-semibold text-gray-900 hover:text-[#1A56DB]"
                    >
                      {r.semana.nomeResort}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {r.semana.cidade}, {r.semana.estado} ·{" "}
                      {r.tipoReserva === "diaria" ? "Diária" : "Semana completa"}
                      {r.dataDiaria &&
                        ` · ${new Date(r.dataDiaria).toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      r.status === "confirmada"
                        ? "bg-green-100 text-green-800"
                        : r.status === "cancelada"
                          ? "bg-gray-100 text-gray-600"
                          : r.status === "prioritaria"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-50 text-[#1A56DB]"
                    }`}
                  >
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    <strong className="text-gray-800">Pontos:</strong>{" "}
                    {r.pontosUtilizados.toLocaleString("pt-BR")} pts
                  </span>
                  <span>
                    <strong className="text-gray-800">Fila:</strong> #{r.posicaoFila}
                  </span>
                  {r.isPrioritaria && r.taxaValor != null && (
                    <span>
                      <strong className="text-gray-800">Taxa:</strong> R${" "}
                      {Number(r.taxaValor).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Criada em {new Date(r.criadoEm).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
