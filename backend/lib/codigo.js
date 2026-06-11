/* Código de ativação determinístico por e-mail (stateless, sem banco):
   codigo = HMAC-SHA256(email_normalizado, CODE_SECRET) truncado.
   O mesmo segredo gera e valida — só quem tem o CODE_SECRET emite códigos. */

const crypto = require('crypto');

function gerarCodigo(email, secret) {
  const norm = String(email || '').trim().toLowerCase();
  const h = crypto.createHmac('sha256', secret).update(norm).digest('hex').toUpperCase();
  return `PMF-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
}

function validarCodigo(email, codigo, secret) {
  const esperado = gerarCodigo(email, secret);
  const a = Buffer.from(String(codigo || '').trim().toUpperCase());
  const b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { gerarCodigo, validarCodigo };
