"""Testes do backend. Nenhum teste chama a API real: o cliente e mockado."""

import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app as app_module


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    app_module.app.config["TESTING"] = True
    with app_module.app.test_client() as c:
        yield c


@pytest.fixture
def fake_anthropic(monkeypatch):
    """Substitui o cliente da API por um mock que devolve um rascunho fixo."""
    fake = MagicMock()
    fake.messages.create.return_value = SimpleNamespace(
        content=[SimpleNamespace(type="text", text="RELATORIO MEDICO\n[PREENCHER: PA]")],
        stop_reason="end_turn",
    )
    monkeypatch.setattr(app_module, "_client", fake)
    return fake


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "ok"


def test_generate_sem_texto(client):
    res = client.post("/api/generate", json={"raw_text": "  "})
    assert res.status_code == 400
    assert "Cole as informacoes" in res.get_json()["error"]


def test_generate_doc_type_invalido(client):
    res = client.post("/api/generate", json={"raw_text": "abc", "doc_type": "receita"})
    assert res.status_code == 400
    assert "invalido" in res.get_json()["error"]


def test_generate_texto_longo(client):
    res = client.post("/api/generate", json={"raw_text": "x" * (app_module.MAX_INPUT_CHARS + 1)})
    assert res.status_code == 400
    assert "muito longo" in res.get_json()["error"]


def test_generate_sem_api_key(client, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY")
    res = client.post("/api/generate", json={"raw_text": "abc"})
    assert res.status_code == 500
    assert "ANTHROPIC_API_KEY" in res.get_json()["error"]


def test_generate_sucesso(client, fake_anthropic):
    res = client.post(
        "/api/generate",
        json={"raw_text": "Paciente 54a, dor toracica.", "doc_type": "relatorio"},
    )
    assert res.status_code == 200
    assert "RELATORIO MEDICO" in res.get_json()["draft"]
    kwargs = fake_anthropic.messages.create.call_args.kwargs
    assert kwargs["messages"] == [{"role": "user", "content": "Paciente 54a, dor toracica."}]
    assert "Resolucao CFM 2.454/2026" in kwargs["system"]


def test_generate_avisa_corte_por_max_tokens(client, fake_anthropic):
    fake_anthropic.messages.create.return_value = SimpleNamespace(
        content=[SimpleNamespace(type="text", text="Texto cortado")],
        stop_reason="max_tokens",
    )
    res = client.post("/api/generate", json={"raw_text": "abc"})
    assert res.status_code == 200
    assert "cortado por limite" in res.get_json()["draft"]


def test_api_nao_cacheia_resposta(client):
    res = client.get("/api/health")
    assert res.headers["Cache-Control"] == "no-store"


def test_prompt_varia_por_tipo_de_documento():
    p = app_module.build_system_prompt("sumario_alta", "cardiologia")
    assert "sumario de alta hospitalar" in p
    assert "cardiologia" in p
    assert "NUNCA" in p  # regra anti-invencao presente em todos os tipos
