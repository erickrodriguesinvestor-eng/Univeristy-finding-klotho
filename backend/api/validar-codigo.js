/* Valida o código de ativação informado pelo aluno na área de login.
   POST { email, codigo } → { valido: true|false }

   Variáveis de ambiente:
   - CODE_SECRET      mesmo segredo usado no webhook
   - ALLOWED_ORIGIN   origem do site (CORS), ex.:
                      https://erickrodriguesinvestor-eng.github.io
*/

const { validarCodigo } = require('../lib/codigo');

module.exports = async (req, res) => {
  const origem = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origem);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { email, codigo } = req.body || {};
  if (!email || !codigo) return res.status(400).json({ valido: false, erro: 'email e codigo são obrigatórios' });

  const valido = validarCodigo(email, codigo, process.env.CODE_SECRET);
  return res.status(200).json({ valido });
};
