import prisma from "@/lib/prisma";

/**
 * Guia 4.10: na primeira reserva do indicado, credita pontos_bonus_indicacao para indicador e indicado.
 */
export async function aplicarBonusIndicacaoPrimeiraReserva(
  clienteId: string,
  reservaId: string
): Promise<void> {
  const total = await prisma.reserva.count({ where: { clienteId } });
  if (total !== 1) return;

  const cliente = await prisma.usuario.findUnique({
    where: { id: clienteId },
    select: { indicadoPorId: true, nome: true },
  });
  if (!cliente?.indicadoPorId) return;

  const row = await prisma.configuracaoAdmin.findUnique({
    where: { chave: "pontos_bonus_indicacao" },
  });
  const pts = row ? parseInt(row.valor, 10) : 500;
  if (!Number.isFinite(pts) || pts < 1) return;

  const indicadorId = cliente.indicadoPorId;

  await prisma.$transaction(async (tx) => {
    const ind = await tx.usuario.findUnique({ where: { id: indicadorId } });
    const cli = await tx.usuario.findUnique({ where: { id: clienteId } });
    if (!ind || !cli) return;

    await tx.transacaoPontos.create({
      data: {
        usuarioId: indicadorId,
        tipo: "entrada",
        quantidade: pts,
        descricao: `Bônus indicação — ${cli.nome} (1ª reserva)`,
        origem: "indicacao",
        referenciaId: reservaId,
      },
    });
    await tx.usuario.update({
      where: { id: indicadorId },
      data: { saldoPontos: { increment: pts } },
    });

    await tx.transacaoPontos.create({
      data: {
        usuarioId: clienteId,
        tipo: "entrada",
        quantidade: pts,
        descricao: "Bônus indicação — sua primeira reserva",
        origem: "indicacao",
        referenciaId: reservaId,
      },
    });
    await tx.usuario.update({
      where: { id: clienteId },
      data: { saldoPontos: { increment: pts } },
    });
  });
}
