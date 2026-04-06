import prisma from "@/lib/prisma";
import { adminAtualizarReserva } from "@/app/admin/actions";

const STATUS_OPTS = [
  "em_fila",
  "prioritaria",
  "em_analise",
  "confirmada",
  "cancelada",
] as const;

export default async function AdminReservasPage() {
  const reservas = await prisma.reserva.findMany({
    orderBy: { criadoEm: "desc" },
    take: 150,
    include: {
      semana: { select: { nomeResort: true, cidade: true, estado: true } },
      cliente: { select: { nome: true, email: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Reservas</h1>
      <p className="text-slate-400 text-sm mb-6">
        Alterar status (confirmada, cancelada, etc.).
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Resort</th>
              <th className="px-3 py-2">Pts</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {reservas.map((r) => (
              <tr key={r.id} className="text-slate-300">
                <td className="px-3 py-2">
                  <div className="text-white text-xs">{r.cliente.nome}</div>
                  <div className="text-xs text-slate-500">{r.cliente.email}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  {r.semana.nomeResort}
                  <div className="text-slate-500">
                    {r.semana.cidade}, {r.semana.estado}
                  </div>
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {r.pontosUtilizados}
                  {r.isPrioritaria && (
                    <span className="block text-amber-400 text-xs">prioritária</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <form action={adminAtualizarReserva} className="flex gap-2 items-center">
                    <input type="hidden" name="reservaId" value={r.id} />
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs max-w-[140px]"
                    >
                      {STATUS_OPTS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                    >
                      OK
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
