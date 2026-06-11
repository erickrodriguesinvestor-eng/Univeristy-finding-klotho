/* Webhook da Stripe: ao confirmar o pagamento (checkout.session.completed),
   gera o código de ativação do comprador e envia por e-mail via Resend.

   Variáveis de ambiente necessárias (Vercel → Settings → Environment Variables):
   - STRIPE_SECRET_KEY      sk_live_...
   - STRIPE_WEBHOOK_SECRET  whsec_...  (criado ao registrar o endpoint)
   - CODE_SECRET            string longa e aleatória (segredo dos códigos)
   - RESEND_API_KEY         re_...     (https://resend.com — envio de e-mail)
   - EMAIL_FROM             ex.: "Plataforma PMF <acesso@seudominio.com>"
*/

const Stripe = require('stripe');
const { gerarCodigo } = require('../lib/codigo');

function lerCorpoBruto(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    req.on('data', c => partes.push(c));
    req.on('end', () => resolve(Buffer.concat(partes)));
    req.on('error', reject);
  });
}

async function enviarEmail(email, codigo) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: 'Seu acesso à Plataforma Perito Médico Federal 🎓',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#18181b">
          <h2 style="letter-spacing:-0.5px">Pagamento confirmado — bem-vindo(a)!</h2>
          <p>Seu código de ativação:</p>
          <p style="font-size:24px;font-weight:bold;font-family:monospace;background:#f4f4f5;
                    border:1px solid #e4e4e7;border-radius:10px;padding:14px 18px;text-align:center">
            ${codigo}
          </p>
          <p><b>Como ativar:</b></p>
          <ol style="line-height:1.8">
            <li>Acesse a <a href="https://erickrodriguesinvestor-eng.github.io/Univeristy-finding-klotho/perito-inss/login.html">área do aluno</a></li>
            <li>Crie sua conta usando <b>este mesmo e-mail</b> (${email})</li>
            <li>Insira o código acima na aba "Ativar acesso"</li>
          </ol>
          <p style="color:#71717a;font-size:13px">O código é pessoal e vinculado ao seu e-mail de compra.
          Dúvidas? Responda este e-mail.</p>
        </div>`
    })
  });
  if (!resp.ok) {
    console.error('Falha no envio de e-mail:', resp.status, await resp.text());
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let evento;
  try {
    const corpo = await lerCorpoBruto(req);
    evento = stripe.webhooks.constructEvent(corpo, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Assinatura do webhook inválida:', err.message);
    return res.status(400).json({ erro: 'Assinatura inválida' });
  }

  if (evento.type === 'checkout.session.completed') {
    const sessao = evento.data.object;
    const email = (sessao.customer_details && sessao.customer_details.email) || sessao.customer_email;
    if (email && sessao.payment_status === 'paid') {
      const codigo = gerarCodigo(email, process.env.CODE_SECRET);
      await enviarEmail(email, codigo);
      console.log('Código enviado para', email);
    }
  }

  res.json({ recebido: true });
};

module.exports.config = { api: { bodyParser: false } };
