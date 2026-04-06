import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { DepositarFormulario } from "./formulario";

export default async function DepositarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/depositar");
  }

  let usuario: { nome: string; email: string; telefone: string | null } | null = null;
  try {
    usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { nome: true, email: true, telefone: true },
    });
  } catch {
    usuario = null;
  }

  if (!usuario) {
    redirect("/login?callbackUrl=/depositar");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SWITCH
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/semanas" className="text-sm text-gray-600 hover:text-blue-600">
              Semanas
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Depositar semana</h1>
          <p className="text-gray-500 text-sm">
            Cadastre sua semana de timeshare para aparecer no marketplace. Tudo em português e
            revisável depois no dashboard.
          </p>
        </div>

        <DepositarFormulario
          defaults={{
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
          }}
        />
      </main>
    </div>
  );
}
