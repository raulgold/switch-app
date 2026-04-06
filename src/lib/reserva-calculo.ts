import type { Semana } from "@prisma/client";

export type TipoReservaCheckout = "semana_completa" | "diaria";

export function pontosParaReserva(
  semana: Pick<Semana, "pontosSemana" | "pontosDiaria" | "isSemanaOuro">,
  tipo: TipoReservaCheckout
): number {
  const base =
    tipo === "semana_completa" ? semana.pontosSemana : semana.pontosDiaria;
  if (semana.isSemanaOuro) {
    return Math.max(1, Math.round(base * 0.7));
  }
  return base;
}

/** Data YYYY-MM-DD deve cair no intervalo da semana (check-in inclusivo, check-out exclusivo). */
export function dataDiariaValida(
  dataStr: string,
  checkin: Date,
  checkout: Date
): boolean {
  const d = new Date(`${dataStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const ci = new Date(checkin);
  const co = new Date(checkout);
  ci.setHours(12, 0, 0, 0);
  co.setHours(12, 0, 0, 0);
  return d.getTime() >= ci.getTime() && d.getTime() < co.getTime();
}
