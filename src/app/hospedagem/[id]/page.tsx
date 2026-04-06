import { permanentRedirect } from "next/navigation";

/** Guia usa /hospedagem/[id]; app principal em /semanas/[id] */
export default async function HospedagemRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`/semanas/${id}`);
}
