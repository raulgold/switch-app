import prisma from "@/lib/prisma";
import {
  adminCreditarPontos,
  adminDebitarPontos,
  adminToggleUsuarioAtivo,
} from "@/app/admin/actions";

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const usuarios = await prisma.usuario.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { nome: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { criadoEm: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Usuários</h1>
      <p className="text-slate-400 text-sm mb-4">
        Busca, banir (ativo) e ajustar pontos manualmente.
      </p>

      <form method="GET" className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="E-mail ou nome"
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white max-w-xs"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
        >
          Buscar
        </button>
      </form>

      <div className="space-y-4">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-white font-medium">{u.nome}</p>
                <p className="text-slate-400 text-xs">{u.email}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {u.tipo} · código {u.codigoIndicacao} · saldo{" "}
                  <span className="text-emerald-400 tabular-nums">
                    {u.saldoPontos.toLocaleString("pt-BR")} pts
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <form action={adminToggleUsuarioAtivo}>
                  <input type="hidden" name="usuarioId" value={u.id} />
                  <input
                    type="hidden"
                    name="ativo"
                    value={u.ativo ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className={`text-xs px-2 py-1 rounded ${
                      u.ativo
                        ? "bg-red-900/50 text-red-300 hover:bg-red-900"
                        : "bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900"
                    }`}
                  >
                    {u.ativo ? "Desativar conta" : "Reativar conta"}
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <form action={adminCreditarPontos} className="flex gap-1 items-center">
                <input type="hidden" name="usuarioId" value={u.id} />
                <input
                  name="quantidade"
                  type="number"
                  min={1}
                  placeholder="pts"
                  className="w-24 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs"
                />
                <input
                  name="descricao"
                  placeholder="motivo"
                  className="w-40 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs"
                />
                <button
                  type="submit"
                  className="rounded bg-emerald-900/60 px-2 py-1 text-xs text-emerald-200"
                >
                  Creditar
                </button>
              </form>
              <form action={adminDebitarPontos} className="flex gap-1 items-center">
                <input type="hidden" name="usuarioId" value={u.id} />
                <input
                  name="quantidade"
                  type="number"
                  min={1}
                  placeholder="pts"
                  className="w-24 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs"
                />
                <input
                  name="descricao"
                  placeholder="motivo"
                  className="w-40 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs"
                />
                <button
                  type="submit"
                  className="rounded bg-red-900/60 px-2 py-1 text-xs text-red-200"
                >
                  Debitar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
