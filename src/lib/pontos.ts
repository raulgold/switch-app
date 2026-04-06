import type { OrigemTransacao } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * Crédito de pontos + registro em transacoes_pontos (atômico).
 */
export async function creditarPontos(
  usuarioId: string,
  quantidade: number,
  descricao: string,
  origem: OrigemTransacao,
  referenciaId?: string | null
) {
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new Error("Quantidade de crédito inválida");
  }

  return prisma.$transaction(async (tx) => {
    const registro = await tx.transacaoPontos.create({
      data: {
        usuarioId,
        tipo: "entrada",
        quantidade,
        descricao,
        origem,
        referenciaId: referenciaId ?? null,
      },
    });
    await tx.usuario.update({
      where: { id: usuarioId },
      data: { saldoPontos: { increment: quantidade } },
    });
    return registro;
  });
}

/**
 * Débito de pontos com checagem de saldo + registro (atômico).
 */
export async function debitarPontos(
  usuarioId: string,
  quantidade: number,
  descricao: string,
  origem: OrigemTransacao,
  referenciaId?: string | null
) {
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new Error("Quantidade de débito inválida");
  }

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) throw new Error("Usuário não encontrado");
    if (usuario.saldoPontos < quantidade) {
      throw new Error("Saldo insuficiente");
    }

    const registro = await tx.transacaoPontos.create({
      data: {
        usuarioId,
        tipo: "saida",
        quantidade,
        descricao,
        origem,
        referenciaId: referenciaId ?? null,
      },
    });
    await tx.usuario.update({
      where: { id: usuarioId },
      data: { saldoPontos: { decrement: quantidade } },
    });
    return registro;
  });
}

/** Base guia 4.6: dias × 800 (temporada pode ajustar depois). */
export function calcularPontosCreditoDeposito(numNoites: number): number {
  const n = Math.max(1, numNoites);
  return Math.round(n * 800);
}
