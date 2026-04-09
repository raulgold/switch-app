import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { lerValorBrutoEnv } from "@/lib/env-raw";

function createPrismaClient() {
  const rawUrl = lerValorBrutoEnv("DATABASE_URL") ?? process.env.DATABASE_URL;

  let pool: Pool;

  if (rawUrl) {
    // Parsear a URL manualmente para evitar qualquer problema de encoding
    // no pg-connection-string com caracteres especiais (@, $) na senha.
    const u = new URL(rawUrl);
    pool = new Pool({
      host: u.hostname,
      port: parseInt(u.port || "5432", 10),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  } else {
    // Fallback para vars individuais (dev sem DATABASE_URL)
    const host = lerValorBrutoEnv("DB_HOST") ?? process.env.DB_HOST!;
    const port = parseInt(
      lerValorBrutoEnv("DB_PORT") ?? process.env.DB_PORT ?? "5432",
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
