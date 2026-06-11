/* ============================================================
   CONFIGURAÇÃO DA PLATAFORMA — edite aqui
   ============================================================ */

const PMF_CONFIG = {
  // Preço exibido na página de vendas
  PRECO: 'R$ 997,00',
  PRECO_PARCELADO: '12x de R$ 97,08',

  // Link de pagamento da Stripe (Payment Link).
  // Crie o seu em: https://dashboard.stripe.com/payment-links
  // (produto "Plataforma PMF", valor R$ 997,00, moeda BRL)
  // e cole a URL abaixo. Enquanto vazio, o botão de compra
  // exibe instruções de contato.
  STRIPE_PAYMENT_LINK: '',

  // URL do backend (Vercel) com webhook Stripe + validação de códigos.
  // Veja backend/README.md. Com a URL preenchida, cada comprador recebe
  // por e-mail um código individual vinculado ao e-mail da compra.
  // Ex.: 'https://pmf-backend.vercel.app'
  API_URL: '',

  // Código de ativação MESTRE — usado apenas como fallback enquanto
  // API_URL estiver vazia (envie manualmente após cada venda).
  CODIGO_ATIVACAO: 'PMF-APROVACAO-2026',

  // E-mail de suporte exibido no checkout
  EMAIL_SUPORTE: 'erickrodriguesinvestor@gmail.com'
};

window.PMF_CONFIG = PMF_CONFIG;
