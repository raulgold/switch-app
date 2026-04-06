import prisma from "@/lib/prisma";
import { notificarAdminDiariaBonusPendenteFireAndForget } from "@/lib/notificacoes";

/** Ao atingir múltiplo de 10 semanas depositadas, abre pendência para o admin (guia 4.10). */
export async function registrarDiariaBonusSeMultiploDez(params: {
  usuarioId: string;
  totalSemanasAposDeposito: number;
  nomeProprietario: string;
  emailProprietario: string;
}): Promise<void> {
  const { usuarioId, totalSemanasAposDeposito, nomeProprietario, emailProprietario } =
    params;

  if (totalSemanasAposDeposito < 1 || totalSemanasAposDeposito % 10 !== 0) {
    return;
  }

  const dup = await prisma.diariaBonusPendente.findFirst({
    where: {
      usuarioId,
      semanasMarco: totalSemanasAposDeposito,
    },
  });
  if (dup) return;

  await prisma.diariaBonusPendente.create({
    data: {
      usuarioId,
      semanasMarco: totalSemanasAposDeposito,
      status: "pendente",
    },
  });

  notificarAdminDiariaBonusPendenteFireAndForget({
    nomeProprietario,
    emailProprietario,
    semanasMarco: totalSemanasAposDeposito,
  });
}
