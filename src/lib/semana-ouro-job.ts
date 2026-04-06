import prisma from "@/lib/prisma";

/**
 * Ativa isSemanaOuro para semanas disponíveis com check-out nos próximos 45 dias;
 * desativa para as demais (regra do guia).
 */
export async function executarJobSemanaOuro(): Promise<{
  ativadas: number;
  desativadas: number;
}> {
  const agora = new Date();
  const lim45 = new Date(agora);
  lim45.setDate(lim45.getDate() + 45);

  const r1 = await prisma.semana.updateMany({
    where: {
      status: "disponivel",
      checkout: { gt: agora, lte: lim45 },
    },
    data: { isSemanaOuro: true },
  });

  const r2 = await prisma.semana.updateMany({
    where: {
      status: "disponivel",
      OR: [{ checkout: { lte: agora } }, { checkout: { gt: lim45 } }],
    },
    data: { isSemanaOuro: false },
  });

  return { ativadas: r1.count, desativadas: r2.count };
}
