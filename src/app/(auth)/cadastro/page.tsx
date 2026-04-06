import { CadastroForm } from "./cadastro-form";

function normalizarRef(raw: string | undefined) {
  return (raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const initialCodigo = normalizarRef(sp.ref);

  return <CadastroForm initialCodigo={initialCodigo} />;
}
