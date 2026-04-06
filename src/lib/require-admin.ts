import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }
  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { tipo: true },
  });
  if (usuario?.tipo !== "admin") {
    redirect("/");
  }
  return session;
}
