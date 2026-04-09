import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

function gerarCodigo(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email e Senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
        });

        if (!usuario || !usuario.senhaHash) return null;

        const senhaCorreta = await bcrypt.compare(
          credentials.password as string,
          usuario.senhaHash
        );

        if (!senhaCorreta) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          image: usuario.fotoUrl ?? null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/cadastro",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Criar usuário automático no primeiro login com Google
      if (account?.provider === "google" && user.email) {
        let existente;
        try {
          existente = await prisma.usuario.findUnique({
            where: { email: user.email },
          });
        } catch (err) {
          console.error("[auth] Erro ao consultar usuário no DB:", err);
          throw err;
        }

        if (existente === null || existente === undefined) {
          let codigo = gerarCodigo();
          for (let i = 0; i < 10; i++) {
            const existe = await prisma.usuario.findUnique({ where: { codigoIndicacao: codigo } });
            if (!existe) break;
            codigo = gerarCodigo();
          }

          const jar = await cookies();
          const refRaw = jar
            .get("switch_ref")
            ?.value?.toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 12);
          let indicadoPorId: string | undefined;
          if (refRaw) {
            const indicador = await prisma.usuario.findUnique({
              where: { codigoIndicacao: refRaw },
            });
            if (indicador && indicador.email !== user.email) {
              indicadoPorId = indicador.id;
            }
          }

          const novo = await prisma.usuario.create({
            data: {
              nome: user.name ?? "Usuário",
              email: user.email,
              fotoUrl: user.image ?? null,
              codigoIndicacao: codigo,
              indicadoPorId,
            },
          });

          jar.set("switch_ref", "", { maxAge: 0, path: "/" });

          user.id = novo.id;
        } else {
          user.id = existente.id;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) token.sub = user.id;
      if (account?.provider === "google" && token.email) {
        const usuario = await prisma.usuario.findUnique({ where: { email: token.email } });
        if (usuario) token.sub = usuario.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
