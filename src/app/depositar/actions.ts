"use server";

import { auth } from "@/lib/auth";
import { registrarDiariaBonusSeMultiploDez } from "@/lib/indicacao-diaria-bonus";
import { notificarDepositoSemanaFireAndForget } from "@/lib/notificacoes";
import { calcularPontosCreditoDeposito } from "@/lib/pontos";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export type DepositarState = { erro?: string };

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export async function depositarSemana(
  _prev: DepositarState,
  formData: FormData
): Promise<DepositarState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { erro: "Faça login para depositar uma semana." };
  }

  const nomeResort = String(formData.get("nomeResort") ?? "").trim();
  const endereco = String(formData.get("endereco") ?? "").trim();
  const cidade = String(formData.get("cidade") ?? "").trim();
  const estado = String(formData.get("estado") ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 2);
  const tipoApartamento = String(formData.get("tipoApartamento") ?? "").trim();
  const checkinStr = String(formData.get("checkin") ?? "");
  const checkoutStr = String(formData.get("checkout") ?? "");
  const pontosSemana = parseInt(String(formData.get("pontosSemana") ?? ""), 10);
  const capacidade = parseInt(String(formData.get("capacidade") ?? ""), 10);
  const fotosRaw = String(formData.get("fotos") ?? "");
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!nomeResort) return { erro: "Informe o nome do resort." };
  if (!endereco) return { erro: "Informe o endereço." };
  if (!cidade) return { erro: "Informe a cidade." };
  if (!estado || !UFS.has(estado)) return { erro: "Selecione um estado (UF) válido." };
  if (!checkinStr || !checkoutStr) return { erro: "Informe check-in e check-out." };
  if (!tipoApartamento) return { erro: "Informe o tipo de apartamento." };
  if (!Number.isFinite(capacidade) || capacidade < 1) {
    return { erro: "Capacidade deve ser pelo menos 1 hóspede." };
  }
  if (!Number.isFinite(pontosSemana) || pontosSemana < 1) {
    return { erro: "Informe os pontos pedidos para a semana completa (mínimo 1)." };
  }

  const checkin = new Date(`${checkinStr}T12:00:00`);
  const checkout = new Date(`${checkoutStr}T12:00:00`);
  if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime())) {
    return { erro: "Datas inválidas." };
  }
  if (checkout <= checkin) {
    return { erro: "A data de check-out deve ser depois do check-in." };
  }

  const ms = checkout.getTime() - checkin.getTime();
  const noites = Math.max(1, Math.round(ms / 86_400_000));
  const pontosDiaria = Math.max(1, Math.round(pontosSemana / noites));

  const fotos = fotosRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
  });
  if (!usuario) return { erro: "Usuário não encontrado." };

  const contatoNome = String(formData.get("contatoNome") ?? "").trim() || usuario.nome;
  const contatoEmail = String(formData.get("contatoEmail") ?? "").trim() || usuario.email;
  const contatoTel =
    String(formData.get("contatoTel") ?? "").trim() || usuario.telefone?.trim() || "—";

  const pontosCredito = calcularPontosCreditoDeposito(noites);

  let totalSemanasAposDeposito = usuario.totalSemanasCadastradas;

  try {
    await prisma.$transaction(async (tx) => {
      const semana = await tx.semana.create({
        data: {
          proprietarioId: session.user.id,
          nomeResort,
          endereco,
          cidade,
          estado,
          checkin,
          checkout,
          tipoApartamento,
          capacidade,
          fotos,
          observacoes: observacoes || null,
          pontosSemana,
          pontosDiaria,
          pontosProprietario: pontosSemana,
          contatoProprietarioNome: contatoNome,
          contatoProprietarioEmail: contatoEmail,
          contatoProprietarioTel: contatoTel,
        },
      });

      await tx.transacaoPontos.create({
        data: {
          usuarioId: session.user.id,
          tipo: "entrada",
          quantidade: pontosCredito,
          descricao: `Depósito semana: ${nomeResort}`,
          origem: "deposito",
          referenciaId: semana.id,
        },
      });

      const atualizado = await tx.usuario.update({
        where: { id: session.user.id },
        data: {
          totalSemanasCadastradas: { increment: 1 },
          tipo: "proprietario",
          saldoPontos: { increment: pontosCredito },
        },
        select: { totalSemanasCadastradas: true },
      });
      totalSemanasAposDeposito = atualizado.totalSemanasCadastradas;
    });
  } catch (e) {
    console.error(e);
    return {
      erro:
        "Não foi possível salvar no banco. Verifique a conexão ou tente novamente em instantes.",
    };
  }

  notificarDepositoSemanaFireAndForget({
    para: usuario.email,
    nomeResort,
    pontosCreditados: pontosCredito,
  });

  await registrarDiariaBonusSeMultiploDez({
    usuarioId: session.user.id,
    totalSemanasAposDeposito,
    nomeProprietario: usuario.nome,
    emailProprietario: usuario.email,
  });

  redirect("/dashboard?deposito=ok");
}
