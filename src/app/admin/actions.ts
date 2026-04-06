"use server";

import { creditarPontos, debitarPontos } from "@/lib/pontos";
import { notificarProprietarioDiariaBonusAtribuidaFireAndForget } from "@/lib/notificacoes";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { StatusReserva } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function adminEncerrarSemana(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("semanaId") ?? "");
  if (!id) return;
  await prisma.semana.update({
    where: { id },
    data: { status: "encerrada" },
  });
  revalidatePath("/admin/semanas");
}

export async function adminAjustarPontosSemana(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("semanaId") ?? "");
  const ps = parseInt(String(formData.get("pontosSemana") ?? ""), 10);
  const pd = parseInt(String(formData.get("pontosDiaria") ?? ""), 10);
  if (!id || !Number.isFinite(ps) || ps < 1 || !Number.isFinite(pd) || pd < 1) {
    return;
  }
  await prisma.semana.update({
    where: { id },
    data: { pontosSemana: ps, pontosDiaria: pd },
  });
  revalidatePath("/admin/semanas");
}

export async function adminAtualizarReserva(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("reservaId") ?? "");
  const status = String(formData.get("status") ?? "") as StatusReserva;
  const validos: StatusReserva[] = [
    "em_fila",
    "prioritaria",
    "em_analise",
    "confirmada",
    "cancelada",
  ];
  if (!id || !validos.includes(status)) return;

  await prisma.reserva.update({
    where: { id },
    data: {
      status,
      ...(status === "confirmada" ? { confirmadaEm: new Date() } : {}),
    },
  });
  revalidatePath("/admin/reservas");
}

export async function adminToggleUsuarioAtivo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("usuarioId") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";
  if (!id) return;
  await prisma.usuario.update({
    where: { id },
    data: { ativo },
  });
  revalidatePath("/admin/usuarios");
}

export async function adminCreditarPontos(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("usuarioId") ?? "");
  const q = parseInt(String(formData.get("quantidade") ?? ""), 10);
  const desc = String(formData.get("descricao") ?? "").trim() || "Crédito administrativo";
  if (!id || !Number.isFinite(q) || q < 1) return;
  await creditarPontos(id, q, desc, "ajuste_admin");
  revalidatePath("/admin/usuarios");
  revalidatePath("/perfil");
}

export async function adminDebitarPontos(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("usuarioId") ?? "");
  const q = parseInt(String(formData.get("quantidade") ?? ""), 10);
  const desc = String(formData.get("descricao") ?? "").trim() || "Débito administrativo";
  if (!id || !Number.isFinite(q) || q < 1) return;
  try {
    await debitarPontos(id, q, desc, "ajuste_admin");
  } catch {
    /* saldo insuficiente — ignorar silenciosamente no admin */
  }
  revalidatePath("/admin/usuarios");
}

export async function adminSalvarConfig(formData: FormData) {
  await requireAdmin();
  const chave = String(formData.get("chave") ?? "");
  const valor = String(formData.get("valor") ?? "").trim();
  if (!chave || !valor) return;
  await prisma.configuracaoAdmin.update({
    where: { chave },
    data: { valor },
  });
  revalidatePath("/admin/configuracoes");
}

export async function adminConcluirDiariaBonus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("pendenteId") ?? "");
  const local = String(formData.get("local") ?? "").trim();
  const dataStr = String(formData.get("dataDiaria") ?? "").trim();
  if (!id || !local || !dataStr) return;

  const dataDiaria = new Date(`${dataStr}T12:00:00`);
  if (Number.isNaN(dataDiaria.getTime())) return;

  const row = await prisma.diariaBonusPendente.findFirst({
    where: { id, status: "pendente" },
    include: { usuario: { select: { email: true } } },
  });
  if (!row) return;

  await prisma.diariaBonusPendente.update({
    where: { id },
    data: { local, dataDiaria, status: "concluida" },
  });

  const dataLabel = dataDiaria.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  notificarProprietarioDiariaBonusAtribuidaFireAndForget({
    para: row.usuario.email,
    local,
    dataLabel,
  });

  revalidatePath("/admin/diarias-bonus");
}
