import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AbasPerfil } from "./abas-perfil";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/perfil");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: {
      transacoes: {
        orderBy: { criadoEm: "desc" },
        take: 200,
      },
    },
  });

  if (!usuario) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1A56DB]">
            SWITCH
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-[#1A56DB]">
              Dashboard
            </Link>
            <Link href="/comprar-pontos" className="text-[#1A56DB] font-medium">
              Comprar pontos
            </Link>
            <Link
              href="/api/auth/signout"
              className="text-gray-500 hover:text-gray-700"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>
        <AbasPerfil
          nome={usuario.nome}
          email={usuario.email}
          telefone={usuario.telefone}
          codigoIndicacao={usuario.codigoIndicacao}
          saldoPontos={usuario.saldoPontos}
          totalSemanasCadastradas={usuario.totalSemanasCadastradas}
          tipo={usuario.tipo}
          transacoes={usuario.transacoes}
        />
      </main>
    </div>
  );
}
