import prisma from "@/lib/prisma";

const PADROES: Record<string, { valor: string; descricao: string }> = {
  taxa_minima_prioridade: {
    valor: "99",
    descricao: "Valor mínimo da taxa de prioridade (R$)",
  },
  multiplicador_demanda: {
    valor: "1.2",
    descricao: "Fator de aumento por demanda alta",
  },
  dias_semana_ouro: {
    valor: "45",
    descricao: "Dias antes do check-out para Semana Ouro",
  },
  desconto_semana_ouro: {
    valor: "30",
    descricao: "Desconto em % nos pontos (Semana Ouro)",
  },
  pontos_bonus_indicacao: {
    valor: "500",
    descricao: "Pontos por indicação confirmada",
  },
  semanas_para_diaria_bonus: {
    valor: "10",
    descricao: "Semanas depositadas para ganhar 1 diária bônus",
  },
  prazo_confirmacao_dias: {
    valor: "7",
    descricao: "Prazo em dias úteis para confirmar com resort",
  },
  conversao_pontos_reais: {
    valor: "10",
    descricao: "Quantos pontos valem R$ 1,00 (referência)",
  },
};

/** Garante chaves do guia 3.6 sem sobrescrever valores já salvos. */
export async function garantirConfiguracoesAdminPadrao() {
  for (const [chave, meta] of Object.entries(PADROES)) {
    await prisma.configuracaoAdmin.upsert({
      where: { chave },
      create: {
        chave,
        valor: meta.valor,
        descricao: meta.descricao,
      },
      update: {},
    });
  }
}
