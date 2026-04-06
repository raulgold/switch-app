import { requireAdmin } from "@/lib/require-admin";
import { garantirConfiguracoesAdminPadrao } from "@/lib/config-admin-seed";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  await garantirConfiguracoesAdminPadrao();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/semanas", label: "Semanas" },
    { href: "/admin/reservas", label: "Reservas" },
    { href: "/admin/diarias-bonus", label: "Diárias bônus" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/configuracoes", label: "Configurações" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 z-20 h-full w-56 border-r border-slate-800 bg-slate-900 p-4 hidden md:block">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
          Admin
        </p>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="mt-8 block text-xs text-slate-500 hover:text-slate-300"
        >
          ← Site público
        </Link>
      </aside>

      <div className="md:pl-56">
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 px-4 py-3 md:hidden flex gap-3 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs whitespace-nowrap text-slate-300"
            >
              {l.label}
            </Link>
          ))}
        </header>
        <div className="p-6 max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
