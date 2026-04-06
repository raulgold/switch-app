import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [
    totalReservas,
    totalUsuarios,
    totalSemanas,
    receitaTaxas,
  ] = await Promise.all([
    prisma.reserva.count(),
    prisma.usuario.count(),
    prisma.semana.count(),
    prisma.reserva.aggregate({
      where: {
        taxaPagaEm: { gte: inicioMes },
        taxaValor: { not: null },
      },
      _sum: { taxaValor: true },
    }),
  ]);

  const receitaNum = receitaTaxas._sum.taxaValor
    ? Number(receitaTaxas._sum.taxaValor)
    : 0;

  const cards = [
    { titulo: "Reservas", valor: totalReservas },
    { titulo: "Usuários", valor: totalUsuarios },
    { titulo: "Semanas cadastradas", valor: totalSemanas },
    {
      titulo: "Receita taxas (mês)",
      valor: receitaNum.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">
        Visão geral do SWITCH — rota oculta do menu público.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.titulo}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">
              {c.titulo}
            </p>
            <p className="text-2xl font-semibold text-white tabular-nums">
              {c.valor}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
