import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { lerValorBrutoEnv } from "@/lib/env-raw";

function createPrismaClient() {
  const host = lerValorBrutoEnv("DB_HOST") ?? process.env.DB_HOST!;
  const port = parseInt(
    lerValorBrutoEnv("DB_PORT") ?? process.env.DB_PORT ?? "6543",
    10
  );
  const user = lerValorBrutoEnv("DB_USER") ?? process.env.DB_USER!;
  const senha =
    lerValorBrutoEnv("DB_PASSWORD") ?? process.env.DB_PASSWORD ?? "";
  const database = lerValorBrutoEnv("DB_NAME") ?? process.env.DB_NAME!;

  const pool = new Pool({
    host,
    port,
    user,
    password: senha,
    database,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

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
