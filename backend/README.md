# Backend — Liberação automática pós-Stripe

Backend serverless (Vercel) que automatiza a entrega do acesso:

```
Aluno paga na Stripe
  → Stripe chama /api/stripe-webhook (checkout.session.completed)
  → backend gera código ÚNICO vinculado ao e-mail do comprador
  → backend envia o código por e-mail (Resend)
Aluno cria conta com o MESMO e-mail e insere o código
  → frontend chama /api/validar-codigo
  → acesso liberado ✅
```

Os códigos são **stateless** (HMAC do e-mail com um segredo): não há banco de
dados, e um código só funciona com o e-mail para o qual foi emitido.

## Passo a passo de implantação (≈20 min)

### 1. Vercel
1. Crie conta em https://vercel.com (grátis).
2. Instale a CLI: `npm i -g vercel`.
3. Na pasta `backend/`: `vercel deploy --prod`.
4. Anote a URL gerada, ex.: `https://pmf-backend.vercel.app`.

### 2. Variáveis de ambiente (Vercel → Project → Settings → Environment Variables)
| Variável | Valor |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (Stripe → Developers → API keys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (criado no passo 3) |
| `CODE_SECRET` | uma string longa e aleatória (ex.: `openssl rand -hex 32`) |
| `RESEND_API_KEY` | `re_...` (https://resend.com — 3.000 e-mails/mês grátis) |
| `EMAIL_FROM` | `Plataforma PMF <acesso@seudominio.com>` (domínio verificado no Resend) |
| `ALLOWED_ORIGIN` | `https://erickrodriguesinvestor-eng.github.io` |

Após salvar, faça redeploy (`vercel deploy --prod`).

### 3. Stripe
1. Crie o **Payment Link** de R$ 997,00 (Dashboard → Payment links).
   Em **After payment → Don't show confirmation page → Redirect**, aponte para
   `https://erickrodriguesinvestor-eng.github.io/Univeristy-finding-klotho/perito-inss/obrigado.html`
   (página que orienta o comprador a conferir o e-mail e ativar a conta).
2. Em **Developers → Webhooks → Add endpoint**:
   - URL: `https://SEU-PROJETO.vercel.app/api/stripe-webhook`
   - Evento: `checkout.session.completed`
3. Copie o **Signing secret** (`whsec_...`) para a variável `STRIPE_WEBHOOK_SECRET`.

### 4. Frontend (`perito-inss/js/config.js`)
```js
STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/SEU_LINK',
API_URL: 'https://SEU-PROJETO.vercel.app',
```

Pronto: com `API_URL` preenchida, a ativação passa a exigir o código individual
enviado por e-mail (vinculado ao e-mail da compra). Sem `API_URL`, o site usa o
código mestre `CODIGO_ATIVACAO` como fallback.

## Teste local do código
```bash
node -e "console.log(require('./lib/codigo').gerarCodigo('aluno@email.com','MEU_SEGREDO'))"
```
Use o modo de teste da Stripe (`sk_test_...` + cartão 4242...) antes de ir para produção.
