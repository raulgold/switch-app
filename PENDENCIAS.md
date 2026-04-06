# SWITCH — Fazer depois (backlog)

Checklist do que ficou **fora** ou **pendente** de configuração na sua máquina / produção.

## Asaas
- [ ] Definir `ASAAS_API_KEY` real (sandbox ou produção) no `.env.local` / Vercel.
- [ ] Configurar **webhook** no painel Asaas apontando para `https://<seu-dominio>/api/webhooks/asaas`.
- [ ] Definir `ASAAS_WEBHOOK_SECRET` e o mesmo token no painel Asaas (header `asaas-access-token`).
- [ ] Testar fluxo **Reserva com prioridade** ponta a ponta (PIX + webhook + reserva `prioritaria`).
- [ ] Em produção: revisar `ASAAS_ENVIRONMENT=production` e URLs.

## Evolution API (WhatsApp) — guia 4.7
- [ ] Subir Evolution (ou alternativa) e variáveis `EVOLUTION_API_URL` / `EVOLUTION_API_KEY`.
- [ ] Implementar `enviar_notificacao` também por WhatsApp (templates PT/EN).

## Resend
- [ ] `RESEND_API_KEY` válida (substituir placeholder).
- [ ] Verificar domínio em Resend e ajustar `EMAIL_FROM`.
- [ ] (Opcional) `ADMIN_NOTIFICATION_EMAIL` — destino dos avisos de diária bônus pendente (senão usa `EMAIL_FROM`).
- [ ] (Opcional) Templates React Email e versão EN dos e-mails.

## Banco / Supabase
- [ ] Garantir pooler + senha corretos se ainda aparecer erro de conexão.
- [ ] Promover admin: `UPDATE usuarios SET tipo = 'admin' WHERE email = '...';`

## Cron Semana Ouro (Vercel / produção)
- [ ] Definir `CRON_SECRET` no ambiente (mesmo valor no header do cron da Vercel, se aplicável).
- [ ] Arquivo `vercel.json` na raiz: cron diário `0 11 * * *` (UTC) — ajuste o horário se precisar; em planos gratuitos o cron da Vercel pode não estar disponível (use chamada manual ou serviço externo).
- [ ] Chamada manual (dev): `GET /api/cron/semana-ouro` com header `Authorization: Bearer <CRON_SECRET>`.

## Fake inventory
- [ ] Rodar seed uma vez: `npx prisma db seed` (usa `DATABASE_URL` do `.env.local` + `tsx`).

## Legal / produto (guia)
- [ ] Páginas `/termos`, política de privacidade, banner de cookies.
- [ ] Revisar textos jurídicos com advogado.

## Deploy (guia etapa 13)
- [ ] Variáveis na Vercel, domínio, HTTPS, teste do fluxo de reserva em produção.
