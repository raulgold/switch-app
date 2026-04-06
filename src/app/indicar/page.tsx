import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CopiarLinkIndicacao } from "./copiar-link";

function baseUrlPublica() {
  const u =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "";
  return u.replace(/\/$/, "");
}

export default async function IndicarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/indicar");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { codigoIndicacao: true, nome: true },
  });
  if (!usuario) redirect("/login");

  const base = baseUrlPublica();
  const pathRef = `/ref/${usuario.codigoIndicacao}`;
  const linkCompleto = base ? `${base}${pathRef}` : pathRef;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#1A56DB]">
            SWITCH
          </Link>
          <Link href="/perfil" className="text-sm text-gray-600 hover:text-[#1A56DB]">
            Perfil
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Indicar amigos</h1>
        <p className="text-gray-600 text-sm mb-6">
          Compartilhe seu link. Quando alguém se cadastrar e fizer a{" "}
          <strong>primeira reserva</strong>, vocês dois ganham pontos (valor em{" "}
          <span className="font-mono text-xs">pontos_bonus_indicacao</span> nas configurações admin).
        </p>

        {!base && (
          <p className="text-amber-800 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
            Defina <code className="font-mono">NEXT_PUBLIC_APP_URL</code> no ambiente para o link
            completo funcionar em produção.
          </p>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Seu código</p>
          <p className="text-3xl font-mono font-bold text-[#1A56DB] mb-4">
            {usuario.codigoIndicacao}
          </p>
          <CopiarLinkIndicacao linkCompleto={linkCompleto} />
        </div>

        <p className="text-xs text-gray-400">
          Proprietários: a cada <strong>10 semanas</strong> depositadas, abrimos uma pendência de{" "}
          <strong>diária bônus</strong> para o admin atribuir local e data (veja também o perfil).
        </p>
      </main>
    </div>
  );
}
