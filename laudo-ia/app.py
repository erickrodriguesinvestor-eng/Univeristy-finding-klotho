"""
Laudo IA — gerador de documento clinico assistido por IA com medico no loop.

Fluxo: texto bruto -> rascunho estruturado (IA) -> revisao do medico -> assinatura.
Conforme o principio da Resolucao CFM 2.454/2026: a IA e ferramenta de apoio,
o medico e o responsavel final, e o uso de IA e declarado no documento.

Privacidade: este servidor NAO grava dados de paciente em disco nem em log.
O texto trafega apenas em memoria, durante a chamada a API.
"""

import os
from flask import Flask, jsonify, request, send_from_directory

try:
    import anthropic
    from anthropic import Anthropic
except ImportError:  # mensagem clara se faltar a dependencia
    anthropic = None
    Anthropic = None

app = Flask(__name__, static_folder="static", static_url_path="")

MODEL = os.environ.get("MODEL", "claude-sonnet-4-6")
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "2000"))
# Limites de entrada: evitam custo descontrolado e abuso do endpoint.
MAX_INPUT_CHARS = int(os.environ.get("MAX_INPUT_CHARS", "30000"))
MAX_SPECIALTY_CHARS = 120

_client = None  # reutilizado entre requisicoes (mantem pool de conexoes)

DOC_LABELS = {
    "relatorio": "relatorio medico / parecer clinico",
    "sumario_alta": "sumario de alta hospitalar",
    "laudo_exame": "laudo de exame",
    "atestado": "atestado / relatorio circunstanciado",
}

DOC_STRUCTURE = {
    "relatorio": (
        "Estruture em: Identificacao (so o que foi fornecido), Historia clinica / "
        "anamnese, Exame fisico, Exames complementares, Hipoteses diagnosticas, "
        "Conduta e Conclusao."
    ),
    "sumario_alta": (
        "Estruture em: Identificacao, Diagnostico principal e secundarios, Motivo da "
        "internacao, Resumo da evolucao, Procedimentos realizados, Medicacoes em uso na "
        "alta, Orientacoes e Plano de seguimento."
    ),
    "laudo_exame": (
        "Estruture em: Identificacao, Exame realizado, Tecnica, Achados (descritivos e "
        "objetivos), Impressao diagnostica e Observacoes."
    ),
    "atestado": (
        "Estruture de forma objetiva e formal, contendo apenas o estritamente "
        "necessario. Inclua CID somente se fornecido pelo medico."
    ),
}


def build_system_prompt(doc_type: str, specialty: str) -> str:
    label = DOC_LABELS.get(doc_type, "documento clinico")
    structure = DOC_STRUCTURE.get(doc_type, "Estruture de forma clara e tecnica.")
    esp = f" da especialidade {specialty}" if specialty else ""
    return (
        f"Voce e um assistente de redacao clinica para um medico brasileiro{esp}. "
        f"Sua funcao e ESTRUTURAR e ORGANIZAR as informacoes fornecidas pelo medico em "
        f"um {label}, em portugues do Brasil, com terminologia tecnica correta.\n\n"
        f"{structure}\n\n"
        "REGRAS INEGOCIAVEIS:\n"
        "1. Use SOMENTE informacoes presentes no texto fornecido pelo medico. NUNCA "
        "invente achados, valores, datas, diagnosticos ou condutas.\n"
        "2. Onde faltar informacao necessaria, escreva um marcador entre colchetes, ex.: "
        "[PREENCHER: pressao arterial], em vez de inventar.\n"
        "3. Voce NAO estabelece diagnostico de forma autonoma nem decide conduta. Voce "
        "organiza o raciocinio do medico, que e o responsavel final pela decisao clinica "
        "(Resolucao CFM 2.454/2026). A IA e apoio, nunca substituto.\n"
        "4. Nao exagere nem suavize achados. Seja fiel ao que foi descrito.\n"
        "5. Nao adicione dados identificaveis alem dos fornecidos.\n"
        "6. Saida: APENAS o documento estruturado, pronto para revisao do medico. Sem "
        "comentarios, sem preambulo, sem despedida."
    )


def get_client():
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    if request.path.startswith("/api/"):
        # respostas da API carregam texto clinico: nunca cachear
        response.headers["Cache-Control"] = "no-store"
    return response


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "model": MODEL,
        "api_key_configured": bool(os.environ.get("ANTHROPIC_API_KEY")),
        "sdk_installed": Anthropic is not None,
    })


@app.route("/api/generate", methods=["POST"])
def generate():
    if Anthropic is None:
        return jsonify({"error": "Dependencia 'anthropic' nao instalada. Rode: pip install -r requirements.txt"}), 500

    if not os.environ.get("ANTHROPIC_API_KEY"):
        return jsonify({"error": "Configure a variavel de ambiente ANTHROPIC_API_KEY (veja o .env.example)."}), 500

    data = request.get_json(silent=True) or {}
    raw_text = (data.get("raw_text") or "").strip()
    doc_type = data.get("doc_type") or "relatorio"
    specialty = (data.get("specialty") or "").strip()[:MAX_SPECIALTY_CHARS]

    if not raw_text:
        return jsonify({"error": "Cole as informacoes clinicas antes de gerar."}), 400
    if len(raw_text) > MAX_INPUT_CHARS:
        return jsonify({"error": f"Texto muito longo ({len(raw_text)} caracteres; maximo {MAX_INPUT_CHARS}). Divida em documentos menores."}), 400
    if doc_type not in DOC_LABELS:
        return jsonify({"error": "Tipo de documento invalido."}), 400

    try:
        msg = get_client().messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=build_system_prompt(doc_type, specialty),
            messages=[{"role": "user", "content": raw_text}],
        )
        draft = "".join(
            block.text for block in msg.content if getattr(block, "type", "") == "text"
        )
        if msg.stop_reason == "max_tokens":
            draft += "\n\n[ATENCAO: o rascunho foi cortado por limite de tamanho. Revise o final ou aumente MAX_TOKENS.]"
        return jsonify({"draft": draft})
    except anthropic.AuthenticationError:
        return jsonify({"error": "Chave de API invalida. Verifique a ANTHROPIC_API_KEY."}), 500
    except anthropic.RateLimitError:
        return jsonify({"error": "Limite de requisicoes atingido. Aguarde alguns segundos e tente de novo."}), 429
    except anthropic.APIConnectionError:
        return jsonify({"error": "Sem conexao com a API. Verifique sua internet e tente de novo."}), 502
    except anthropic.APIStatusError as e:
        return jsonify({"error": f"Falha na API ({e.status_code}). Tente de novo em instantes."}), 502
    except Exception as e:  # ultimo recurso: nao vazar stack trace ao usuario
        return jsonify({"error": f"Falha ao gerar: {type(e).__name__}"}), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
