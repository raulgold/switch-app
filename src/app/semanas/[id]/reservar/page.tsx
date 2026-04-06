import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { pontosParaReserva } from "@/lib/reserva-calculo";
import { CheckoutFormulario } from "./checkout-form";

async function taxaMinimaPrioridade(): Promise<number> {
  const row = await prisma.configuracaoAdmin.findUnique({
    where: { chave: "taxa_minima_prioridade" },
  });
  if (!row) return 99;
  const n = parseFloat(row.valor.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 99;
}

export default async function SemanaReservarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/semanas/${id}/reservar?tipo=${sp.tipo ?? "semana"}`)}`
    );
  }

  const tipoUi = sp.tipo === "diaria" ? "diaria" : "semana";
  const tipoReserva = tipoUi === "diaria" ? "diaria" : "semana_completa";

  const semana = await prisma.semana.findUnique({ where: { id } });
  if (!semana) notFound();

  if (semana.status !== "disponivel") {
    redirect(`/semanas/${id}`);
  }
  if (semana.proprietarioId === session.user.id) {
    redirect(`/semanas/${id}`);
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
  });
  if (!usuario) {
    redirect("/login");
  }

  const base =
    tipoReserva === "semana_completa"
      ? semana.pontosSemana
      : semana.pontosDiaria;
  const originalOuro =
    semana.isSemanaOuro && base > 0 ? base : null;
  const pontosNecessarios = pontosParaReserva(semana, tipoReserva);
  const taxa = await taxaMinimaPrioridade();

  const maxDiaria = new Date(semana.checkout);
  maxDiaria.setDate(maxDiaria.getDate() - 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#1A56DB]">
            SWITCH
          </Link>
          <Link
            href={`/semanas/${id}`}
            className="text-sm text-gray-600 hover:text-[#1A56DB]"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Checkout de reserva
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Revise os dados, aceite os termos e escolha fila comum ou prioridade
          (Asaas — PIX).
        </p>

        <CheckoutFormulario
          semanaId={semana.id}
          nomeResort={semana.nomeResort}
          tipo={tipoUi}
          pontosNecessarios={pontosNecessarios}
          pontosOriginais={originalOuro}
          saldoAtual={usuario.saldoPontos}
          taxaPrioridade={taxa}
          minDiariaISO={semana.checkin.toISOString().slice(0, 10)}
          maxDiariaISO={maxDiaria.toISOString().slice(0, 10)}
        />
      </main>
    </div>
  );
}
