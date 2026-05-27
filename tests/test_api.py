"""
Unit tests for EarthSafe Flask API.
Run: pytest tests/test_api.py -v
"""

import pytest
import json
import sys
from pathlib import Path

# Allow imports from src/
sys.path.insert(0, str(Path(__file__).parents[1]))

from src.api.app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ── /health ───────────────────────────────────────────────────────────────────

def test_health_returns_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    data = r.get_json()
    assert data["status"] == "ok"
    assert data["model"] == "xgboost"
    assert isinstance(data["features"], list)
    assert len(data["features"]) == 5


# ── /predict ──────────────────────────────────────────────────────────────────

VALID_PAYLOAD = {
    "magnitude": 3.0,
    "depth": 10.0,
    "gap": 90.0,
    "rms": 0.3,
    "location_type": 0,
}

def test_predict_low_hazard(client):
    r = client.post("/predict", json={**VALID_PAYLOAD, "magnitude": 3.0})
    assert r.status_code == 200
    data = r.get_json()
    assert data["hazard_label"] == "Low"
    assert data["color"] == "#2ecc71"
    assert "probabilities" in data
    assert set(data["probabilities"].keys()) == {"Low", "Moderate", "High"}


def test_predict_moderate_hazard(client):
    r = client.post("/predict", json={**VALID_PAYLOAD, "magnitude": 5.0})
    assert r.status_code == 200
    data = r.get_json()
    assert data["hazard_label"] == "Moderate"
    assert data["color"] == "#f39c12"


def test_predict_high_hazard(client):
    r = client.post("/predict", json={**VALID_PAYLOAD, "magnitude": 7.5})
    assert r.status_code == 200
    data = r.get_json()
    assert data["hazard_label"] == "High"
    assert data["color"] == "#e74c3c"


def test_predict_probabilities_sum_to_one(client):
    r = client.post("/predict", json=VALID_PAYLOAD)
    assert r.status_code == 200
    probs = r.get_json()["probabilities"]
    assert abs(sum(probs.values()) - 1.0) < 1e-3


def test_predict_missing_field_returns_400(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "magnitude"}
    r = client.post("/predict", json=payload)
    assert r.status_code == 400
    assert "Missing fields" in r.get_json()["error"]


def test_predict_invalid_value_returns_400(client):
    r = client.post("/predict", json={**VALID_PAYLOAD, "magnitude": "big"})
    assert r.status_code == 400


def test_predict_no_body_returns_400(client):
    r = client.post("/predict", content_type="application/json", data="")
    assert r.status_code == 400


def test_predict_returns_input_echo(client):
    r = client.post("/predict", json=VALID_PAYLOAD)
    assert r.status_code == 200
    data = r.get_json()
    assert "input" in data
    assert data["input"]["magnitude"] == VALID_PAYLOAD["magnitude"]
