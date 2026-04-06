import { decodeRefPrioridade } from "@/lib/checkout-prioridade-ref";
import { aplicarBonusIndicacaoPrimeiraReserva } from "@/lib/indicacao-bonus-reserva";
import prisma from "@/lib/prisma";
import {
  dataDiariaValida,
  pontosParaReserva,
} from "@/lib/reserva-calculo";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AsaasPaymentPayload = {
  object?: string;
  id?: string;
  customer?: string;
  value?: number;
  externalReference?: string | null;
  status?: string;
};

type AsaasWebhookBody = {
  event?: string;
  payment?: AsaasPaymentPayload;
};

function verificarToken(request: Request): boolean {
  const secret = process.env.ASAAS_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const token = request.headers.get("asaas-access-token");
  return token === secret;
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "switch-asaas-webhook" });
}

export async function POST(request: Request) {
  if (!verificarToken(request)) {
    return NextResponse.json({ erro: "unauthorized" }, { status: 401 });
  }

  let body: AsaasWebhookBody;
  try {
    body = (await request.json()) as AsaasWebhookBody;
  } catch {
    return NextResponse.json({ erro: "invalid json" }, { status: 400 });
  }

  const event = body.event ?? "";
  if (event !== "PAYMENT_CONFIRMED" && event !== "PAYMENT_RECEIVED") {
    return NextResponse.json({ ok: true, ignored: event });
  }

  const payment = body.payment;
  if (!payment?.id || !payment.externalReference) {
    return NextResponse.json({ ok: true, ignored: "no payment ref" });
  }

  const payId = payment.id;
  const refRaw = payment.externalReference;
  const ref = decodeRefPrioridade(refRaw);
  if (!ref) {
    console.warn("[asaas webhook] externalReference inválido:", refRaw);
    return NextResponse.json({ ok: true, ignored: "bad ref" });
  }

  const existing = await prisma.reserva.findFirst({
    where: { asaasPaymentId: payId },
  });
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const semana = await prisma.semana.findUnique({ where: { id: ref.s } });
  if (!semana || semana.status !== "disponivel") {
    console.error("[asaas webhook] semana indisponível", ref.s);
    return NextResponse.json({ ok: true, ignored: "semana" });
  }

  if (ref.t === "diaria") {
    if (
      !ref.dd ||
      !dataDiariaValida(ref.dd, semana.checkin, semana.checkout)
    ) {
      console.error("[asaas webhook] data diária inválida", ref);
      return NextResponse.json({ ok: true, ignored: "data" });
    }
  }

  const pontos = pontosParaReserva(semana, ref.t);
  const valorTaxa = Number(payment.value);
  if (!Number.isFinite(valorTaxa) || valorTaxa <= 0) {
    console.error("[asaas webhook] valor inválido", payment.value);
    return NextResponse.json({ ok: true, ignored: "value" });
  }

  const dataDiaria =
    ref.t === "diaria" && ref.dd ? new Date(`${ref.dd}T12:00:00`) : null;

  let novaReservaId: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const dup = await tx.reserva.findFirst({ where: { asaasPaymentId: payId } });
      if (dup) return;

      const ativa = await tx.reserva.findFirst({
        where: {
          semanaId: ref.s,
          clienteId: ref.u,
          status: { in: ["em_fila", "prioritaria", "em_analise"] },
        },
      });
      if (ativa) {
        throw new Error("reserva_ativa");
      }

      const usuario = await tx.usuario.findUnique({ where: { id: ref.u } });
      if (!usuario) throw new Error("no user");
      if (usuario.saldoPontos < pontos) throw new Error("saldo");

      const agg = await tx.reserva.aggregate({
        where: { semanaId: ref.s },
        _max: { posicaoFila: true },
      });
      const posicaoFila = (agg._max.posicaoFila ?? 0) + 1;

      const reserva = await tx.reserva.create({
        data: {
          semanaId: ref.s,
          clienteId: ref.u,
          tipoReserva: ref.t,
          dataDiaria,
          pontosUtilizados: pontos,
          isPrioritaria: true,
          taxaValor: new Prisma.Decimal(valorTaxa.toFixed(2)),
          taxaPagaEm: new Date(),
          asaasPaymentId: payId,
          posicaoFila,
          status: "prioritaria",
          termosAceitosEm: new Date(),
        },
      });
      novaReservaId = reserva.id;

      await tx.transacaoPontos.create({
        data: {
          usuarioId: ref.u,
          tipo: "saida",
          quantidade: pontos,
          descricao: `Reserva prioritária — ${semana.nomeResort}`,
          origem: "reserva",
          referenciaId: reserva.id,
        },
      });

      await tx.usuario.update({
        where: { id: ref.u },
        data: { saldoPontos: { decrement: pontos } },
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "reserva_ativa" || msg === "saldo" || msg === "no user") {
      console.error("[asaas webhook] regra de negócio:", msg);
      return NextResponse.json({ ok: true, ignored: msg });
    }
    console.error("[asaas webhook]", e);
    return NextResponse.json({ erro: "process" }, { status: 500 });
  }

  if (novaReservaId) {
    await aplicarBonusIndicacaoPrimeiraReserva(ref.u, novaReservaId);
  }

  return NextResponse.json({ ok: true });
}
