import dns from "dns";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { lerValorBrutoEnv } from "@/lib/env-raw";

// Força resolução IPv4 — evita ENETUNREACH para endereços IPv6 do Supabase no Vercel
dns.setDefaultResultOrder("ipv4first");

function createPrismaClient() {
  let pool: Pool;

  // Prioridade 1: variáveis individuais (sem risco de parsing de URL especial)
  // DB_HOST está definido no Vercel como aws-0-sa-east-1.pooler.supabase.com
  const host =
    lerValorBrutoEnv("DB_HOST") ?? process.env.DB_HOST;

  if (host) {
    const port = parseInt(
      lerValorBrutoEnv("DB_PORT") ?? process.env.DB_PORT ?? "6543",
      10
    );
    const user =
      lerValorBrutoEnv("DB_USER") ?? process.env.DB_USER ?? "postgres";
    const password =
      lerValorBrutoEnv("DB_PASSWORD") ?? process.env.DB_PASSWORD ?? "";
    const database =
      lerValorBrutoEnv("DB_NAME") ?? process.env.DB_NAME ?? "postgres";

    pool = new Pool({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  } else {
    // Fallback: parsear DATABASE_URL manualmente (evita encoding de caracteres especiais)
    const rawUrl =
      lerValorBrutoEnv("DATABASE_URL") ?? process.env.DATABASE_URL!;
    const u = new URL(rawUrl);
    pool = new Pool({
      host: u.hostname,
      port: parseInt(u.port || "6543", 10),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
