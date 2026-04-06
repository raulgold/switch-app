import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

function gerarCodigoIndicacao(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

function normalizarCodigoRef(s: string | undefined | null) {
  return (s ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, codigoIndicacao } = await req.json();

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });
    }

    const doBody = normalizarCodigoRef(
      typeof codigoIndicacao === "string" ? codigoIndicacao : ""
    );
    const doCookie = normalizarCodigoRef(req.cookies.get("switch_ref")?.value);
    const refCodigo = doBody || doCookie;

    let indicadoPorId: string | undefined;
    if (refCodigo) {
      const indicador = await prisma.usuario.findUnique({
        where: { codigoIndicacao: refCodigo },
      });
      if (
        indicador &&
        indicador.email.trim().toLowerCase() !== String(email).trim().toLowerCase()
      ) {
        indicadoPorId = indicador.id;
      }
    }

    let meuCodigo = gerarCodigoIndicacao();
    for (let i = 0; i < 10; i++) {
      const existe = await prisma.usuario.findUnique({ where: { codigoIndicacao: meuCodigo } });
      if (!existe) break;
      meuCodigo = gerarCodigoIndicacao();
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        codigoIndicacao: meuCodigo,
        indicadoPorId,
        saldoPontos: 0,
      },
    });

    const res = NextResponse.json({ message: "Conta criada com sucesso!" }, { status: 201 });
    res.cookies.set("switch_ref", "", { maxAge: 0, path: "/" });
    return res;
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
