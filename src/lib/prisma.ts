import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { lerValorBrutoEnv } from "@/lib/env-raw";

function cleanConnectionString(url: string): string {
  // Remove parâmetros que o pg não entende (ex: pgbouncer=true é só para o Prisma)
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("pgbouncer");
    parsed.searchParams.delete("connection_limit");
    return parsed.toString();
  } catch {
    return url;
  }
}

function createPrismaClient() {
  // Em produção (Vercel) não existe .env.local, então usamos DATABASE_URL diretamente.
  // A senha na URL já está URL-encoded, o que evita qualquer problema de interpolação com $.
  const rawUrl =
    lerValorBrutoEnv("DATABASE_URL") ?? process.env.DATABASE_URL;

  const connectionString = rawUrl ? cleanConnectionString(rawUrl) : undefined;

  let pool: Pool;

  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  } else {
    // Fallback para vars individuais (dev sem DATABASE_URL)
    const host = lerValorBrutoEnv("DB_HOST") ?? process.env.DB_HOST!;
    const port = parseInt(
      lerValorBrutoEnv("DB_PORT") ?? process.env.DB_PORT ?? "6543",
      10
    );
    const user = lerValorBrutoEnv("DB_USER") ?? process.env.DB_USER!;
    const senha =
      lerValorBrutoEnv("DB_PASSWORD") ?? process.env.DB_PASSWORD ?? "";
    const database = lerValorBrutoEnv("DB_NAME") ?? process.env.DB_NAME!;

    pool = new Pool({
      host,
      port,
      user,
      password: senha,
      database,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
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
