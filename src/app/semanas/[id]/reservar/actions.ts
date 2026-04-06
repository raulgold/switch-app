"use server";

import { auth } from "@/lib/auth";
import {
  buscarOuCriarClienteAsaas,
  asaasConfigurado,
  criarCobrancaPix,
  dataVencimentoHojeBr,
} from "@/lib/asaas";
import { encodeRefPrioridade } from "@/lib/checkout-prioridade-ref";
import prisma from "@/lib/prisma";
import {
  dataDiariaValida,
  pontosParaReserva,
  type TipoReservaCheckout,
} from "@/lib/reserva-calculo";
import { aplicarBonusIndicacaoPrimeiraReserva } from "@/lib/indicacao-bonus-reserva";
import { notificarReservaFilaFireAndForget } from "@/lib/notificacoes";
import { redirect } from "next/navigation";

export type CheckoutState =
  | { ok: true; invoiceUrl: string }
  | { erro: string };

async function taxaMinimaPrioridade(): Promise<number> {
  const row = await prisma.configuracaoAdmin.findUnique({
    where: { chave: "taxa_minima_prioridade" },
  });
  if (!row) return 99;
  const n = parseFloat(row.valor.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 99;
}

async function temReservaAtiva(semanaId: string, clienteId: string) {
  const r = await prisma.reserva.findFirst({
    where: {
      semanaId,
      clienteId,
      status: { in: ["em_fila", "prioritaria", "em_analise"] },
    },
  });
  return Boolean(r);
}

export async function reservarGratuitamente(
  _prev: CheckoutState | undefined,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { erro: "Faça login para reservar." };
  }

  const semanaId = String(formData.get("semanaId") ?? "");
  const tipoRaw = String(formData.get("tipo") ?? "");
  const tipo: TipoReservaCheckout =
    tipoRaw === "diaria" ? "diaria" : "semana_completa";
  const dataDiariaStr = String(formData.get("dataDiaria") ?? "").trim();
  const aceito = formData.get("aceitoTermos") === "on";

  if (!aceito) {
    return { erro: "Você precisa aceitar os Termos de Reserva." };
  }

  const semana = await prisma.semana.findUnique({ where: { id: semanaId } });
  if (!semana || semana.status !== "disponivel") {
    return { erro: "Semana indisponível." };
  }
  if (semana.proprietarioId === session.user.id) {
    return { erro: "Você não pode reservar o próprio anúncio." };
  }

  if (tipo === "diaria") {
    if (!dataDiariaStr || !dataDiariaValida(dataDiariaStr, semana.checkin, semana.checkout)) {
      return { erro: "Informe uma data de diária válida dentro do período da semana." };
    }
  }

  const pontos = pontosParaReserva(semana, tipo);
  if (pontos < 1) {
    return { erro: "Valor em pontos inválido." };
  }

  if (await temReservaAtiva(semanaId, session.user.id)) {
    return { erro: "Você já possui uma reserva ativa nesta semana." };
  }

  const dataDiaria =
    tipo === "diaria" ? new Date(`${dataDiariaStr}T12:00:00`) : null;

  let emailPosReserva: {
    para: string;
    nomeResort: string;
    posicaoFila: number;
    pontos: number;
  } | null = null;
  let reservaIdBonus: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.findUnique({
        where: { id: session.user!.id },
      });
      if (!usuario) throw new Error("Usuário não encontrado");
      if (usuario.saldoPontos < pontos) throw new Error("Saldo insuficiente");

      const posicaoFila = await (async () => {
        const agg = await tx.reserva.aggregate({
          where: { semanaId },
          _max: { posicaoFila: true },
        });
        return (agg._max.posicaoFila ?? 0) + 1;
      })();

      const reserva = await tx.reserva.create({
        data: {
          semanaId,
          clienteId: session.user!.id,
          tipoReserva: tipo,
          dataDiaria,
          pontosUtilizados: pontos,
          isPrioritaria: false,
          posicaoFila,
          status: "em_fila",
          termosAceitosEm: new Date(),
        },
      });
      reservaIdBonus = reserva.id;

      await tx.transacaoPontos.create({
        data: {
          usuarioId: session.user!.id,
          tipo: "saida",
          quantidade: pontos,
          descricao: `Reserva ${tipo === "diaria" ? "diária" : "semana"} — ${semana.nomeResort}`,
          origem: "reserva",
          referenciaId: reserva.id,
        },
      });

      await tx.usuario.update({
        where: { id: session.user!.id },
        data: { saldoPontos: { decrement: pontos } },
      });

      emailPosReserva = {
        para: usuario.email,
        nomeResort: semana.nomeResort,
        posicaoFila,
        pontos,
      };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao reservar";
    if (msg === "Saldo insuficiente") {
      return { erro: "Saldo de pontos insuficiente para esta reserva." };
    }
    console.error(e);
    return { erro: "Não foi possível concluir a reserva. Tente novamente." };
  }

  if (reservaIdBonus) {
    await aplicarBonusIndicacaoPrimeiraReserva(session.user.id, reservaIdBonus);
  }
  if (emailPosReserva) {
    notificarReservaFilaFireAndForget(emailPosReserva);
  }

  redirect("/minhas-reservas?ok=1");
}

export async function checkoutReserva(
  prev: CheckoutState | undefined,
  formData: FormData
): Promise<CheckoutState> {
  const intencao = String(formData.get("intencao") ?? "gratis");
  if (intencao === "prioridade") {
    return reservarComPrioridade(prev, formData);
  }
  return reservarGratuitamente(prev, formData);
}

export async function reservarComPrioridade(
  _prev: CheckoutState | undefined,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { erro: "Faça login para reservar." };
  }

  if (!asaasConfigurado()) {
    return {
      erro:
        "Pagamento Asaas não configurado. Defina ASAAS_API_KEY no .env.local (sandbox).",
    };
  }

  const semanaId = String(formData.get("semanaId") ?? "");
  const tipoRaw = String(formData.get("tipo") ?? "");
  const tipo: TipoReservaCheckout =
    tipoRaw === "diaria" ? "diaria" : "semana_completa";
  const dataDiariaStr = String(formData.get("dataDiaria") ?? "").trim();
  const aceito = formData.get("aceitoTermos") === "on";

  if (!aceito) {
    return { erro: "Você precisa aceitar os Termos de Reserva." };
  }

  const semana = await prisma.semana.findUnique({ where: { id: semanaId } });
  if (!semana || semana.status !== "disponivel") {
    return { erro: "Semana indisponível." };
  }
  if (semana.proprietarioId === session.user.id) {
    return { erro: "Você não pode reservar o próprio anúncio." };
  }

  if (tipo === "diaria") {
    if (!dataDiariaStr || !dataDiariaValida(dataDiariaStr, semana.checkin, semana.checkout)) {
      return { erro: "Informe uma data de diária válida dentro do período da semana." };
    }
  }

  const pontos = pontosParaReserva(semana, tipo);

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
  });
  if (!usuario) return { erro: "Usuário não encontrado." };
  if (usuario.saldoPontos < pontos) {
    return { erro: "Saldo de pontos insuficiente. Compre pontos antes da prioridade." };
  }

  if (await temReservaAtiva(semanaId, session.user.id)) {
    return { erro: "Você já possui uma reserva ativa nesta semana." };
  }

  const taxa = await taxaMinimaPrioridade();
  const ref = encodeRefPrioridade({
    v: 1,
    u: session.user.id,
    s: semanaId,
    t: tipo,
    dd: tipo === "diaria" ? dataDiariaStr : null,
  });

  try {
    const customerId = await buscarOuCriarClienteAsaas({
      nome: usuario.nome,
      email: usuario.email,
    });

    const payment = await criarCobrancaPix({
      customerId,
      value: taxa,
      dueDate: dataVencimentoHojeBr(),
      externalReference: ref,
      description: `SWITCH — Taxa de prioridade — ${semana.nomeResort}`,
    });

    const url = payment.invoiceUrl || payment.bankSlipUrl;
    if (!url) {
      return {
        erro:
          "Cobrança criada, mas a Asaas não retornou link de pagamento. Verifique o painel Asaas.",
      };
    }

    return { ok: true, invoiceUrl: url };
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro Asaas";
    return { erro: msg };
  }
}
