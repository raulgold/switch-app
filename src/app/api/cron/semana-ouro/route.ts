import { executarJobSemanaOuro } from "@/lib/semana-ouro-job";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const ok =
    secret &&
    auth === `Bearer ${secret}`;

  if (!ok) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const resultado = await executarJobSemanaOuro();
    return NextResponse.json({ ok: true, ...resultado });
  } catch (e) {
    console.error("[cron semana-ouro]", e);
    return NextResponse.json({ erro: "Falha ao executar job" }, { status: 500 });
  }
}
