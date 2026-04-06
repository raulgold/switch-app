import prisma from "@/lib/prisma";
import { adminSalvarConfig } from "@/app/admin/actions";

export default async function AdminConfiguracoesPage() {
  const itens = await prisma.configuracaoAdmin.findMany({
    orderBy: { chave: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
      <p className="text-slate-400 text-sm mb-6">
        Chaves usadas pelo sistema (taxa mínima, bônus, etc.). Valores em texto.
      </p>

      <div className="space-y-4 max-w-xl">
        {itens.map((c) => (
          <form
            key={c.chave}
            action={adminSalvarConfig}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <input type="hidden" name="chave" value={c.chave} />
            <p className="text-xs text-slate-500 font-mono mb-1">{c.chave}</p>
            {c.descricao && (
              <p className="text-xs text-slate-400 mb-2">{c.descricao}</p>
            )}
            <div className="flex gap-2">
              <input
                name="valor"
                defaultValue={c.valor}
                className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm text-white hover:bg-[#1447be]"
              >
                Salvar
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
