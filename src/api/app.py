"""
EarthSafe Flask API

Endpoints:
    GET  /health          — liveness check
    POST /predict         — predict hazard level from seismic features
    GET  /recent          — last 24h M>=2.5 earthquakes from USGS (proxy)

Run locally:
    python src/api/app.py

Example predict request:
    curl -X POST http://localhost:5000/predict \
         -H "Content-Type: application/json" \
         -d '{"magnitude": 5.2, "depth": 30, "gap": 120, "rms": 0.5, "location_type": 1}'
"""

import joblib
import requests
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS

MODEL_DIR = Path(__file__).parents[2] / "models"

app = Flask(__name__)
CORS(app)

# Load model artifacts once at startup
_model = joblib.load(MODEL_DIR / "xgb_model.pkl")
_le = joblib.load(MODEL_DIR / "label_encoder.pkl")
_features = (MODEL_DIR / "feature_names.txt").read_text().splitlines()

HAZARD_COLORS = {"Low": "#2ecc71", "Moderate": "#f39c12", "High": "#e74c3c"}
USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return jsonify({"status": "ok", "model": "xgboost", "features": _features})


# ── Predict ───────────────────────────────────────────────────────────────────

@app.post("/predict")
def predict():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    # Validate & extract features
    missing = [f for f in _features if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        X = np.array([[float(body[f]) for f in _features]])
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid feature value: {e}"}), 400

    proba = _model.predict_proba(X)[0]
    class_idx = int(np.argmax(proba))
    label = _le.inverse_transform([class_idx])[0]

    return jsonify({
        "hazard_label": label,
        "color": HAZARD_COLORS[label],
        "probabilities": {
            cls: round(float(p), 4)
            for cls, p in zip(_le.classes_, proba)
        },
        "input": {f: body[f] for f in _features},
    })


# ── Recent earthquakes (USGS proxy) ──────────────────────────────────────────

@app.get("/recent")
def recent():
    hours = int(request.args.get("hours", 24))
    min_mag = float(request.args.get("minmagnitude", 2.5))
    limit = int(request.args.get("limit", 100))

    end = datetime.now(timezone.utc)
    start = end - timedelta(hours=hours)

    try:
        resp = requests.get(USGS_URL, params={
            "format": "geojson",
            "starttime": start.strftime("%Y-%m-%dT%H:%M:%S"),
            "endtime": end.strftime("%Y-%m-%dT%H:%M:%S"),
            "minmagnitude": min_mag,
            "orderby": "time",
            "limit": limit,
        }, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": f"USGS API error: {e}"}), 502

    earthquakes = []
    for feature in resp.json().get("features", []):
        props = feature["properties"]
        coords = feature["geometry"]["coordinates"]
        mag = props.get("mag")
        if mag is None:
            continue

        if mag < 4.0:
            label = "Low"
        elif mag < 6.0:
            label = "Moderate"
        else:
            label = "High"

        earthquakes.append({
            "magnitude": mag,
            "depth": coords[2],
            "longitude": coords[0],
            "latitude": coords[1],
            "place": props.get("place", ""),
            "time": props.get("time"),
            "hazard_label": label,
            "color": HAZARD_COLORS[label],
            "url": props.get("url", ""),
        })

    return jsonify({
        "count": len(earthquakes),
        "hours": hours,
        "earthquakes": earthquakes,
    })


# ── Entry ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
