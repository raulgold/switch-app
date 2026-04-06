import { config } from "dotenv";

// Carrega .env.local
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Para migrations: usa conexão direta (porta 5432, sem pgbouncer)
    url: process.env["DIRECT_URL"] as string,
  },
});
