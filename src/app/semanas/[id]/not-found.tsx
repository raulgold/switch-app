import Link from "next/link";

export default function SemanaNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Semana não encontrada
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Esse anúncio não existe ou foi removido.
      </p>
      <Link
        href="/semanas"
        className="text-[#1A56DB] font-semibold hover:underline"
      >
        Ver semanas disponíveis
      </Link>
    </div>
  );
}
