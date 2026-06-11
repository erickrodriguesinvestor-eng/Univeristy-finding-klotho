/* ============================================================
   AUTH — login com senha + ativação por código (pós-compra)
   Contas e sessão em localStorage; senha com hash SHA-256.
   Observação: proteção client-side, adequada para organizar o
   acesso; segurança forte exige backend.
   ============================================================ */

const PMFAuth = (() => {

  const KEY_USUARIOS = 'pmf_usuarios';
  const KEY_SESSAO = 'pmf_sessao';

  async function sha256(texto) {
    const dados = new TextEncoder().encode(texto);
    const hash = await crypto.subtle.digest('SHA-256', dados);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getUsuarios() {
    try { return JSON.parse(localStorage.getItem(KEY_USUARIOS) || '{}'); }
    catch { return {}; }
  }
  function setUsuarios(u) { localStorage.setItem(KEY_USUARIOS, JSON.stringify(u)); }

  function getSessao() {
    try { return JSON.parse(localStorage.getItem(KEY_SESSAO) || 'null'); }
    catch { return null; }
  }

  function usuarioAtual() {
    const s = getSessao();
    if (!s) return null;
    const u = getUsuarios()[s.email];
    return u ? Object.assign({ email: s.email }, u) : null;
  }

  async function cadastrar(nome, email, senha) {
    email = (email || '').trim().toLowerCase();
    if (!nome || !nome.trim()) throw new Error('Informe seu nome.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('E-mail inválido.');
    if (!senha || senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
    const usuarios = getUsuarios();
    if (usuarios[email]) throw new Error('Já existe uma conta com este e-mail. Use "Entrar".');
    usuarios[email] = { nome: nome.trim(), hash: await sha256(senha), ativo: false, criadoEm: new Date().toISOString() };
    setUsuarios(usuarios);
    localStorage.setItem(KEY_SESSAO, JSON.stringify({ email }));
    return usuarios[email];
  }

  async function entrar(email, senha) {
    email = (email || '').trim().toLowerCase();
    const u = getUsuarios()[email];
    if (!u) throw new Error('Conta não encontrada. Crie sua conta primeiro.');
    if (u.hash !== await sha256(senha || '')) throw new Error('Senha incorreta.');
    localStorage.setItem(KEY_SESSAO, JSON.stringify({ email }));
    return u;
  }

  async function ativar(codigo) {
    const s = getSessao();
    if (!s) throw new Error('Entre na sua conta antes de ativar.');

    let valido = false;
    if (PMF_CONFIG.API_URL) {
      // validação no backend: código individual vinculado ao e-mail da compra
      try {
        const r = await fetch(PMF_CONFIG.API_URL.replace(/\/$/, '') + '/api/validar-codigo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: s.email, codigo: (codigo || '').trim() })
        });
        valido = r.ok && (await r.json()).valido === true;
      } catch {
        throw new Error('Não foi possível contatar o servidor de ativação. Verifique sua conexão e tente novamente.');
      }
      if (!valido) throw new Error('Código inválido para este e-mail. Use o MESMO e-mail da compra e o código recebido por e-mail.');
    } else {
      valido = (codigo || '').trim().toUpperCase() === (PMF_CONFIG.CODIGO_ATIVACAO || '').toUpperCase();
      if (!valido) throw new Error('Código inválido. Confira o e-mail de confirmação da compra ou fale com o suporte.');
    }

    const usuarios = getUsuarios();
    usuarios[s.email].ativo = true;
    usuarios[s.email].ativadoEm = new Date().toISOString();
    setUsuarios(usuarios);
    return true;
  }

  function sair() {
    localStorage.removeItem(KEY_SESSAO);
    location.href = 'vendas.html';
  }

  /* Guard: chame no topo das páginas protegidas */
  function exigirAcesso() {
    const u = usuarioAtual();
    if (!u) { location.replace('vendas.html'); return false; }
    if (!u.ativo) { location.replace('login.html#ativar'); return false; }
    return true;
  }

  /* Insere saudação + botão sair na topbar (páginas protegidas) */
  function montarBarraUsuario() {
    const u = usuarioAtual();
    const links = document.querySelector('.tb-links');
    if (!u || !links) return;
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = 'Sair (' + u.nome.split(' ')[0] + ')';
    a.addEventListener('click', ev => { ev.preventDefault(); sair(); });
    links.appendChild(a);
  }

  return { cadastrar, entrar, ativar, sair, exigirAcesso, usuarioAtual, montarBarraUsuario };
})();

window.PMFAuth = PMFAuth;
