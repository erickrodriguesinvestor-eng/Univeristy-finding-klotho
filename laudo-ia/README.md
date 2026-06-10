# Laudo IA — documento clínico com médico no loop

Gerador de documentos clínicos assistido por IA. O médico cola as informações,
a IA devolve um rascunho estruturado, o médico **revisa, assina e exporta**.

A IA é ferramenta de apoio; a decisão e a assinatura são do médico. Cada documento
sai com a declaração de uso de IA exigida pela **Resolução CFM nº 2.454/2026**.

## Por que isso existe
A CFM 2.454/2026 obriga um médico responsável no loop de toda IA médica. Isso é
fricção para produtos de software puro — e é exatamente o que este fluxo entrega de
fábrica: revisão obrigatória + assinatura + declaração de uso de IA. O produto vende
velocidade ao médico sem nunca tirar o médico da responsabilidade.

## O fluxo (4 estados)
1. **Entrada** — notas clínicas brutas (digitadas ou ditadas).
2. **Rascunho IA** — texto estruturado no formato do documento escolhido.
3. **Revisão** — o médico edita; só avança ao confirmar que leu e revisou tudo.
4. **Assinado** — nome + CRM + data + declaração CFM, pronto para imprimir/PDF.

Tipos de documento já incluídos: relatório/parecer, sumário de alta, laudo de exame,
atestado/relatório circunstanciado.

## Garantias embutidas (não são opcionais no código)
- A IA **não inventa** dados: o que falta vira marcador `[PREENCHER: ...]`.
- A IA **não emite diagnóstico autônomo** nem decide conduta.
- Não dá para **assinar sem revisar** (checkbox de revisão obrigatório), nem
  **finalizar sem nome e CRM**. Marcadores `[PREENCHER]` restantes geram alerta.
- O servidor **não grava** texto de paciente em disco nem em log (só trafega em memória)
  e as respostas da API saem com `Cache-Control: no-store`.
- Entrada limitada a 30.000 caracteres (configurável) — protege contra custo
  descontrolado e abuso do endpoint.

## Rodar localmente
Requisitos: Python 3.10+.

```bash
git clone <seu-repo>.git
cd laudo-ia
pip install -r requirements.txt
cp .env.example .env        # edite e coloque sua ANTHROPIC_API_KEY
# (Linux/Mac) export $(cat .env | xargs)   |   (Windows) defina as variáveis no painel
python app.py
```
Abra http://localhost:8000

Verifique a configuração em http://localhost:8000/api/health — mostra se a chave
de API e o SDK estão presentes, sem expor segredos.

## Testes
Nenhum teste chama a API real (zero custo, zero dado de paciente):

```bash
pip install pytest
pytest tests/ -v
```

## Publicar (para vender / demonstrar)
Funciona em qualquer host de Python (Render, Railway, Fly.io). Comando de start:
```
gunicorn app:app        # adicione gunicorn ao requirements em produção
```
Defina `ANTHROPIC_API_KEY` nas variáveis de ambiente do host. **Nunca** suba o `.env`.

## Trocar o motor de IA
Tudo passa por `app.py` → função `generate`. Para usar modelo local (privacidade total,
LGPD), troque a chamada `Anthropic(...)` pelo seu endpoint local. A interface não muda.
Modelo e custo controlados por `MODEL` (padrão `claude-fable-5`, o modelo mais
capaz; troque por `claude-sonnet-4-6` ou `claude-haiku-4-5` para baratear em escala).

## Como vender (primeiros R$)
1. Use você mesmo por uma semana na sua rotina. Cronometre antes/depois.
2. Pegue 3 médicos/clínicas e ofereça: "rodo 5 documentos de vocês na frente de vocês".
3. Cobre por uso (por documento) ou assinatura mensal por médico. Comece manual e feio.
4. Só invista em login/multiusuário quando o terceiro cliente já tiver pago.

## Conformidade e limites
Apoio à redação. Não substitui avaliação médica. O médico signatário é o responsável
pelo conteúdo. Para dados de paciente, observe a LGPD: evite identificadores
desnecessários e prefira modelo local quando o cliente exigir retenção zero.
