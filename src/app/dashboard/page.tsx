import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: {
      semanas: { orderBy: { criadoEm: "desc" }, take: 5 },
      reservas: {
        orderBy: { criadoEm: "desc" },
        take: 5,
        include: { semana: true },
      },
      transacoes: { orderBy: { criadoEm: "desc" }, take: 5 },
    },
  });

  if (!usuario) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1A56DB]">SWITCH</Link>
          <div className="flex items-center gap-4">
            <Link href="/perfil" className="text-sm text-[#1A56DB] font-medium hover:underline">
              Perfil
            </Link>
            <Link href="/comprar-pontos" className="text-sm text-gray-600 hover:text-[#1A56DB]">
              Comprar pontos
            </Link>
            <span className="text-sm text-gray-600">Olá, {usuario.nome.split(" ")[0]}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Boas-vindas + Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Saldo de pontos */}
          <div className="bg-blue-600 text-white rounded-2xl p-6 col-span-1">
            <p className="text-blue-100 text-sm mb-1">Saldo de pontos</p>
            <p className="text-4xl font-bold">{usuario.saldoPontos.toLocaleString("pt-BR")}</p>
            <p className="text-blue-200 text-sm mt-1">pontos disponíveis</p>
          </div>

          {/* Semanas cadastradas */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Semanas cadastradas</p>
            <p className="text-4xl font-bold text-gray-900">{usuario.totalSemanasCadastradas}</p>
            <Link href="/depositar" className="text-blue-600 text-sm mt-1 hover:underline block">
              + Depositar semana
            </Link>
          </div>

          {/* Código de indicação */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Seu código de indicação</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">{usuario.codigoIndicacao}</p>
            <Link href="/indicar" className="text-blue-600 text-sm mt-1 hover:underline block">
              Link de indicação — bônus na 1ª reserva
            </Link>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { href: "/semanas", label: "🏖️ Ver semanas", desc: "Explorar ofertas" },
            { href: "/depositar", label: "📥 Depositar", desc: "Cadastrar semana" },
            { href: "/minhas-semanas", label: "📋 Minhas semanas", desc: "Gerenciar" },
            { href: "/minhas-reservas", label: "🎫 Minhas reservas", desc: "Histórico" },
            { href: "/indicar", label: "🤝 Indicar", desc: "Compartilhar link" },
          ].map((acao) => (
            <Link
              key={acao.href}
              href={acao.href}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition text-center"
            >
              <p className="text-lg mb-1">{acao.label}</p>
              <p className="text-xs text-gray-400">{acao.desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Últimas semanas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Suas semanas recentes</h3>
            {usuario.semanas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-3">Você ainda não cadastrou semanas</p>
                <Link
                  href="/depositar"
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Depositar primeira semana
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {usuario.semanas.map((semana) => (
                  <li key={semana.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{semana.nomeResort}</p>
                      <p className="text-xs text-gray-400">{semana.cidade}, {semana.estado}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      semana.status === "disponivel"
                        ? "bg-green-100 text-green-700"
                        : semana.status === "reservada"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {semana.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Extrato de pontos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Extrato de pontos</h3>
            {usuario.transacoes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma transação ainda</p>
            ) : (
              <ul className="space-y-3">
                {usuario.transacoes.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm text-gray-700">{tx.descricao}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.criadoEm).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${
                      tx.tipo === "entrada" ? "text-green-600" : "text-red-500"
                    }`}>
                      {tx.tipo === "entrada" ? "+" : "-"}{tx.quantidade} pts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
