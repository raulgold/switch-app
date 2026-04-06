import { auth } from "@/lib/auth";
import Link from "next/link";
import { PacotesLista } from "./pacotes-lista";

const CONVERSAO = 10;

export const metadata = {
  title: "Comprar pontos — SWITCH",
};

export default async function ComprarPontosPage() {
  const session = await auth();

  const pacotes = [
    { id: "p1", pontos: 1_000, precoCentavos: 100_00, rotulo: "Entrada" },
    { id: "p2", pontos: 5_000, precoCentavos: 480_00, rotulo: "Popular" },
    { id: "p3", pontos: 10_000, precoCentavos: 900_00, rotulo: "Melhor valor" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1A56DB]">
            SWITCH
          </Link>
          <div className="flex gap-4 text-sm">
            {session ? (
              <>
                <Link href="/perfil" className="text-gray-600 hover:text-[#1A56DB]">
                  Perfil
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-[#1A56DB]">
                  Dashboard
                </Link>
              </>
            ) : (
              <Link href="/login" className="text-[#1A56DB] font-medium">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comprar pontos</h1>
        <p className="text-gray-600 text-sm mb-2">
          {CONVERSAO} pontos Switch ≈ R$ 1,00. Os valores abaixo seguem o guia do produto;
          o pagamento com PIX, cartão ou boleto via Asaas entra na etapa 7 (checkout).
        </p>
        <p className="text-amber-800 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-8">
          Pontos não têm valor monetário fora da plataforma (regra de negócio SWITCH).
        </p>

        <PacotesLista pacotes={pacotes} logado={Boolean(session?.user?.id)} />
      </main>
    </div>
  );
}
