const ASAAS_SANDBOX = "https://sandbox.asaas.com/api/v3";
const ASAAS_PROD = "https://api.asaas.com/api/v3";

function baseUrl() {
  return process.env.ASAAS_ENVIRONMENT === "production"
    ? ASAAS_PROD
    : ASAAS_SANDBOX;
}

function apiKey() {
  const k = process.env.ASAAS_API_KEY?.trim();
  if (!k || k === "PREENCHER_NO_ASAAS") return null;
  return k;
}

export function asaasConfigurado(): boolean {
  return apiKey() != null;
}

async function asaasFetch<T>(
  path: string,
  init: RequestInit & { method?: string } = {}
): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("ASAAS_API_KEY não configurada");

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: key,
      ...init.headers,
    },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Asaas ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

type CustomerResp = { id: string; email?: string };
type CustomersListResp = { data: CustomerResp[] };

export async function buscarOuCriarClienteAsaas(params: {
  nome: string;
  email: string;
}): Promise<string> {
  const q = encodeURIComponent(params.email);
  const lista = await asaasFetch<CustomersListResp>(
    `/customers?email=${q}&limit=1`
  );
  const existente = lista.data?.[0];
  if (existente?.id) return existente.id;

  const criado = await asaasFetch<CustomerResp>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: params.nome,
      email: params.email,
      cpfCnpj: "24971563792",
      notificationDisabled: true,
    }),
  });
  if (!criado.id) throw new Error("Asaas não retornou id do cliente");
  return criado.id;
}

export type CriarCobrancaPixParams = {
  customerId: string;
  value: number;
  dueDate: string;
  externalReference: string;
  description: string;
};

type PaymentResp = {
  id: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  status: string;
};

export async function criarCobrancaPix(
  p: CriarCobrancaPixParams
): Promise<PaymentResp> {
  return asaasFetch<PaymentResp>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: p.customerId,
      billingType: "PIX",
      value: p.value,
      dueDate: p.dueDate,
      externalReference: p.externalReference,
      description: p.description.slice(0, 500),
    }),
  });
}

export function dataVencimentoHojeBr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
