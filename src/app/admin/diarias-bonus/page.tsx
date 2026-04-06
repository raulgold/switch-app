import { adminConcluirDiariaBonus } from "@/app/admin/actions";
import prisma from "@/lib/prisma";

export default async function AdminDiariasBonusPage() {
  const pendentes = await prisma.diariaBonusPendente.findMany({
    where: { status: "pendente" },
    orderBy: { criadoEm: "asc" },
    include: {
      usuario: { select: { nome: true, email: true, totalSemanasCadastradas: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-2">Diárias bônus (pendentes)</h1>
      <p className="text-slate-400 text-sm mb-8">
        A cada 10 semanas depositadas o sistema abre uma pendência. Preencha local e data e marque como
        concluída — o proprietário recebe e-mail.
      </p>

      {pendentes.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhuma pendência no momento.</p>
      ) : (
        <ul className="space-y-8">
          {pendentes.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4"
            >
              <div className="text-sm text-slate-300">
                <p>
                  <span className="text-slate-500">Proprietário:</span>{" "}
                  <strong className="text-white">{p.usuario.nome}</strong> ({p.usuario.email})
                </p>
                <p className="mt-1">
                  <span className="text-slate-500">Marco:</span>{" "}
                  <strong className="text-amber-200">{p.semanasMarco} semanas</strong> cadastradas
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Aberta em {new Date(p.criadoEm).toLocaleString("pt-BR")}
                </p>
              </div>

              <form action={adminConcluirDiariaBonus} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input type="hidden" name="pendenteId" value={p.id} />
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Local (resort / endereço)</label>
                  <input
                    name="local"
                    required
                    placeholder="Ex: Resort X — Cidade/UF"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Data da diária</label>
                  <input
                    name="dataDiaria"
                    type="date"
                    required
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 px-4 transition"
                  >
                    Concluir e notificar
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
