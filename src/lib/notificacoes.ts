import { Resend } from "resend";

function resendPronto() {
  const k = process.env.RESEND_API_KEY?.trim();
  if (!k || k.startsWith("PREENCHER")) return null;
  return k;
}

/**
 * E-mail via Resend (4.7 — sem Evolution/WhatsApp).
 * Sem API key válida: no-op (não quebra fluxo).
 */
export async function enviarEmailSwitch(params: {
  para: string;
  assunto: string;
  html: string;
}): Promise<{ ok: boolean; skipped?: boolean; erro?: string }> {
  const key = resendPronto();
  if (!key) return { ok: false, skipped: true };

  const from =
    process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev";

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to: params.para,
      subject: params.assunto,
      html: params.html,
    });
    if (error) {
      console.error("[Resend]", error);
      return { ok: false, erro: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[Resend]", e);
    return { ok: false, erro: e instanceof Error ? e.message : "erro" };
  }
}

export function notificarDepositoSemanaFireAndForget(params: {
  para: string;
  nomeResort: string;
  pontosCreditados: number;
}) {
  const html = `
    <p>Olá,</p>
    <p>Sua semana <strong>${escapeHtml(params.nomeResort)}</strong> foi publicada no SWITCH.</p>
    <p>Você recebeu <strong>${params.pontosCreditados.toLocaleString("pt-BR")} pontos</strong> pelo depósito.</p>
    <p>— Equipe SWITCH</p>
  `;
  void enviarEmailSwitch({
    para: params.para,
    assunto: "SWITCH — Semana publicada",
    html,
  });
}

export function notificarReservaFilaFireAndForget(params: {
  para: string;
  nomeResort: string;
  posicaoFila: number;
  pontos: number;
}) {
  const html = `
    <p>Olá,</p>
    <p>Sua reserva em <strong>${escapeHtml(params.nomeResort)}</strong> foi registrada na <strong>fila comum</strong>.</p>
    <p>Posição na fila: <strong>#${params.posicaoFila}</strong><br/>
    Pontos utilizados: <strong>${params.pontos.toLocaleString("pt-BR")}</strong></p>
    <p>A hospedagem só é confirmada após contato com o resort (até 7 dias úteis).</p>
    <p>— Equipe SWITCH</p>
  `;
  void enviarEmailSwitch({
    para: params.para,
    assunto: "SWITCH — Reserva na fila",
    html,
  });
}

export function notificarAdminDiariaBonusPendenteFireAndForget(params: {
  nomeProprietario: string;
  emailProprietario: string;
  semanasMarco: number;
}) {
  const adminTo =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim();
  if (!adminTo) {
    console.warn(
      "[SWITCH] Defina ADMIN_NOTIFICATION_EMAIL (ou EMAIL_FROM) para avisar admin sobre diária bônus."
    );
    return;
  }
  const html = `
    <p>Proprietário <strong>${escapeHtml(params.nomeProprietario)}</strong> (${escapeHtml(params.emailProprietario)}) atingiu <strong>${params.semanasMarco} semanas</strong> depositadas.</p>
    <p>Atribua local e data da diária bônus em <strong>/admin/diarias-bonus</strong>.</p>
  `;
  void enviarEmailSwitch({
    para: adminTo,
    assunto: `SWITCH — Diária bônus pendente (${params.semanasMarco} semanas)`,
    html,
  });
}

export function notificarProprietarioDiariaBonusAtribuidaFireAndForget(params: {
  para: string;
  local: string;
  dataLabel: string;
}) {
  const html = `
    <p>Olá,</p>
    <p>Sua <strong>diária bônus</strong> foi registrada no SWITCH.</p>
    <p><strong>Local:</strong> ${escapeHtml(params.local)}<br/>
    <strong>Data:</strong> ${escapeHtml(params.dataLabel)}</p>
    <p>— Equipe SWITCH</p>
  `;
  void enviarEmailSwitch({
    para: params.para,
    assunto: "SWITCH — Diária bônus atribuída",
    html,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
