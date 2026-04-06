import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  adminAjustarPontosSemana,
  adminEncerrarSemana,
} from "@/app/admin/actions";

export default async function AdminSemanasPage() {
  const semanas = await prisma.semana.findMany({
    orderBy: { criadoEm: "desc" },
    take: 150,
    include: {
      proprietario: { select: { nome: true, email: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Semanas</h1>
      <p className="text-slate-400 text-sm mb-6">
        Encerrar anúncio ou ajustar pontos exibidos.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-3 py-2">Resort</th>
              <th className="px-3 py-2">Local</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Pts semana</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {semanas.map((s) => (
              <tr key={s.id} className="text-slate-300">
                <td className="px-3 py-2">
                  <span className="text-white font-medium">{s.nomeResort}</span>
                  {s.isFake && (
                    <span className="ml-2 text-orange-400 text-xs">FAKE</span>
                  )}
                  <div className="text-xs text-slate-500">
                    {s.proprietario?.email ?? "—"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {s.cidade}, {s.estado}
                </td>
                <td className="px-3 py-2">{s.status}</td>
                <td className="px-3 py-2">
                  <form action={adminAjustarPontosSemana} className="flex flex-wrap gap-1 items-center">
                    <input type="hidden" name="semanaId" value={s.id} />
                    <input
                      name="pontosSemana"
                      type="number"
                      defaultValue={s.pontosSemana}
                      className="w-20 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs"
                    />
                    <input
                      name="pontosDiaria"
                      type="number"
                      defaultValue={s.pontosDiaria}
                      className="w-20 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs"
                    />
                    <button
                      type="submit"
                      className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                    >
                      Salvar pts
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2 space-y-1">
                  <Link
                    href={`/semanas/${s.id}`}
                    className="block text-xs text-[#6ea8ff] hover:underline"
                  >
                    Ver público
                  </Link>
                  {s.status !== "encerrada" && (
                    <form action={adminEncerrarSemana}>
                      <input type="hidden" name="semanaId" value={s.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Encerrar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
