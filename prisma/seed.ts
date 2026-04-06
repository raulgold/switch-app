/**
 * Fake inventory do guia (4.9) — idempotente por nome do resort + isFake.
 * Rodar: npx prisma db seed
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL ausente — defina no .env.local para rodar o seed.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type FakeRow = {
  nomeResort: string;
  cidade: string;
  estado: string;
  pontosSemana: number;
  tipoApartamento: string;
  capacidade: number;
  nota: number;
  totalAvaliacoes: number;
  checkinOffsetDias: number;
  duracaoDias: number;
};

const FAKE_SEMANAS: FakeRow[] = [
  {
    nomeResort: "Salinas Maceió Resort",
    cidade: "Maceió",
    estado: "AL",
    pontosSemana: 18_000,
    tipoApartamento: "cobertura",
    capacidade: 4,
    nota: 4.8,
    totalAvaliacoes: 142,
    checkinOffsetDias: 40,
    duracaoDias: 7,
  },
  {
    nomeResort: "Beach Park Suites Resort",
    cidade: "Aquiraz",
    estado: "CE",
    pontosSemana: 22_000,
    tipoApartamento: "suite_master",
    capacidade: 6,
    nota: 4.9,
    totalAvaliacoes: 210,
    checkinOffsetDias: 55,
    duracaoDias: 7,
  },
  {
    nomeResort: "Costa do Sauípe Premium",
    cidade: "Mata de São João",
    estado: "BA",
    pontosSemana: 25_000,
    tipoApartamento: "2quartos",
    capacidade: 4,
    nota: 4.7,
    totalAvaliacoes: 98,
    checkinOffsetDias: 25,
    duracaoDias: 7,
  },
  {
    nomeResort: "Riviera de Santa Cruz",
    cidade: "Bertioga",
    estado: "SP",
    pontosSemana: 15_000,
    tipoApartamento: "standard",
    capacidade: 4,
    nota: 4.5,
    totalAvaliacoes: 76,
    checkinOffsetDias: 70,
    duracaoDias: 7,
  },
  {
    nomeResort: "Eco Resort Angra",
    cidade: "Angra dos Reis",
    estado: "RJ",
    pontosSemana: 20_000,
    tipoApartamento: "terreo",
    capacidade: 4,
    nota: 4.6,
    totalAvaliacoes: 115,
    checkinOffsetDias: 32,
    duracaoDias: 7,
  },
  {
    nomeResort: "Aldeia das Águas",
    cidade: "Barra Mansa",
    estado: "RJ",
    pontosSemana: 12_000,
    tipoApartamento: "standard",
    capacidade: 4,
    nota: 4.3,
    totalAvaliacoes: 54,
    checkinOffsetDias: 90,
    duracaoDias: 7,
  },
  {
    nomeResort: "Transamerica Comandatuba",
    cidade: "Una",
    estado: "BA",
    pontosSemana: 28_000,
    tipoApartamento: "suite",
    capacidade: 6,
    nota: 4.9,
    totalAvaliacoes: 188,
    checkinOffsetDias: 48,
    duracaoDias: 7,
  },
  {
    nomeResort: "Grand Mercure Iguassu",
    cidade: "Foz do Iguaçu",
    estado: "PR",
    pontosSemana: 19_000,
    tipoApartamento: "2quartos",
    capacidade: 4,
    nota: 4.7,
    totalAvaliacoes: 131,
    checkinOffsetDias: 15,
    duracaoDias: 7,
  },
];

async function main() {
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  let criadas = 0;
  for (const row of FAKE_SEMANAS) {
    const existe = await prisma.semana.findFirst({
      where: { nomeResort: row.nomeResort, isFake: true },
    });
    if (existe) continue;

    const checkin = new Date(hoje);
    checkin.setDate(checkin.getDate() + row.checkinOffsetDias);
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + row.duracaoDias);

    const pontosDiaria = Math.max(1, Math.round(row.pontosSemana / 7));

    await prisma.semana.create({
      data: {
        proprietarioId: null,
        nomeResort: row.nomeResort,
        endereco: "Endereço de demonstração — SWITCH",
        cidade: row.cidade,
        estado: row.estado,
        checkin,
        checkout,
        tipoApartamento: row.tipoApartamento,
        capacidade: row.capacidade,
        fotos: [],
        observacoes:
          "Semana de demonstração (fake inventory). Não é oferta real. Badge DEMONSTRAÇÃO no site.",
        pontosSemana: row.pontosSemana,
        pontosDiaria,
        pontosProprietario: row.pontosSemana,
        avaliacaoMedia: new Prisma.Decimal(row.nota.toFixed(2)),
        totalAvaliacoes: row.totalAvaliacoes,
        status: "disponivel",
        isFake: true,
        isSemanaOuro: false,
        destaqueEncalhada: false,
        contatoProprietarioNome: "SWITCH Demo",
        contatoProprietarioEmail: "demo@weekswap.com.br",
        contatoProprietarioTel: "—",
      },
    });
    criadas += 1;
  }

  console.log(
    `[seed] Fake: ${criadas} criadas, ${FAKE_SEMANAS.length - criadas} já existiam.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
