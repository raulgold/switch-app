import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function SemanasPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  const semanas = await prisma.semana.findMany({
    where: {
      status: "disponivel",
      ...(params.cidade ? { cidade: { contains: params.cidade, mode: "insensitive" } } : {}),
      ...(params.estado ? { estado: params.estado.toUpperCase() } : {}),
    },
    orderBy: [{ isSemanaOuro: "desc" }, { criadoEm: "desc" }],
    take: 50,
  });

  const estados = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
    "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">SWITCH</Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
                <Link href="/depositar" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  + Depositar semana
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600">Entrar</Link>
                <Link href="/cadastro" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Semanas disponíveis</h1>
          <p className="text-gray-500 text-sm">{semanas.length} semana{semanas.length !== 1 ? "s" : ""} encontrada{semanas.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Filtros */}
        <form method="GET" className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
            <input
              name="cidade"
              defaultValue={params.cidade || ""}
              placeholder="Ex: Caldas Novas"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              name="estado"
              defaultValue={params.estado || ""}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Filtrar
          </button>
          {(params.cidade || params.estado) && (
            <Link href="/semanas" className="text-sm text-gray-500 hover:text-gray-700 py-2">
              Limpar filtros
            </Link>
          )}
        </form>

        {/* Cards */}
        {semanas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400 text-lg mb-2">Nenhuma semana disponível</p>
            <p className="text-gray-400 text-sm mb-6">Tente outros filtros ou seja o primeiro a depositar!</p>
            <Link href="/depositar" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Depositar minha semana
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semanas.map((semana) => (
              <Link
                key={semana.id}
                href={`/semanas/${semana.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition overflow-hidden"
              >
                {/* Foto ou placeholder */}
                <div className="h-44 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                  {semana.fotos.length > 0 ? (
                    <img
                      src={semana.fotos[0]}
                      alt={semana.nomeResort}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">🏖️</span>
                  )}
                  {semana.isFake && (
                    <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      DEMONSTRAÇÃO
                    </span>
                  )}
                  {semana.isSemanaOuro && (
                    <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                      ⭐ Semana Ouro
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                    {semana.nomeResort}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    📍 {semana.cidade}, {semana.estado}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-bold text-lg">
                        {semana.pontosSemana.toLocaleString("pt-BR")} pts
                      </p>
                      <p className="text-gray-400 text-xs">semana completa</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 font-medium text-sm">
                        {semana.pontosDiaria.toLocaleString("pt-BR")} pts/dia
                      </p>
                      <p className="text-gray-400 text-xs">diária</p>
                    </div>
                  </div>

                  {Number(semana.avaliacaoMedia) > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm text-gray-600">
                        {Number(semana.avaliacaoMedia).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">({semana.totalAvaliacoes})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
