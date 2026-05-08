"""
EarthSafe — Streamlit Frontend

Pages:
  1. Live Prediction  — sliders → real-time XGBoost hazard prediction
  2. Global Activity  — Plotly world map of last 24h earthquakes from USGS

Run:
    streamlit run src/app/streamlit_app.py
"""

import time
import joblib
import requests
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import streamlit as st
from pathlib import Path
from datetime import datetime, timezone

# ── Paths ─────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parents[2]
MODEL_PATH = ROOT / "models" / "xgb_model.pkl"
ENCODER_PATH = ROOT / "models" / "label_encoder.pkl"
FEATURES = ["magnitude", "depth", "gap", "rms", "location_type"]
LABEL_ORDER = ["Low", "Moderate", "High"]

HAZARD_COLOR = {"Low": "#2ecc71", "Moderate": "#f39c12", "High": "#e74c3c"}
HAZARD_EMOJI = {"Low": "🟢", "Moderate": "🟡", "High": "🔴"}
HAZARD_BG = {
    "Low": "rgba(46,204,113,0.15)",
    "Moderate": "rgba(243,156,18,0.15)",
    "High": "rgba(231,76,60,0.15)",
}

USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

# ── Page config ───────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="EarthSafe",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
    .hazard-box {
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin: 8px 0;
    }
    .big-label {
        font-size: 3rem;
        font-weight: 800;
        letter-spacing: 2px;
    }
    .prob-bar-label { font-size: 0.85rem; color: #666; margin-bottom: 2px; }
    section[data-testid="stSidebar"] { min-width: 320px; }
</style>
""", unsafe_allow_html=True)


# ── Model loader ──────────────────────────────────────────────────────────────

@st.cache_resource
def load_model():
    model = joblib.load(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    return model, le


# ── USGS data fetcher ─────────────────────────────────────────────────────────

@st.cache_data(ttl=300)  # refresh every 5 min
def fetch_recent(hours: int = 24, min_mag: float = 2.5, limit: int = 200) -> pd.DataFrame:
    from datetime import timedelta
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
    except Exception as e:
        st.warning(f"USGS API error: {e}")
        return pd.DataFrame()

    rows = []
    for f in resp.json().get("features", []):
        p = f["properties"]
        c = f["geometry"]["coordinates"]
        mag = p.get("mag")
        if mag is None:
            continue
        label = "High" if mag >= 6.0 else ("Moderate" if mag >= 4.0 else "Low")
        rows.append({
            "magnitude": mag,
            "depth": round(c[2], 1),
            "longitude": c[0],
            "latitude": c[1],
            "place": p.get("place", ""),
            "time": pd.to_datetime(p["time"], unit="ms", utc=True),
            "hazard_label": label,
            "url": p.get("url", ""),
        })
    df = pd.DataFrame(rows)
    if not df.empty:
        df = df.sort_values("time", ascending=False).reset_index(drop=True)
    return df


def predict(model, le, magnitude, depth, gap, rms, location_type):
    X = np.array([[magnitude, depth, gap, rms, location_type]])
    proba = model.predict_proba(X)[0]
    idx = int(np.argmax(proba))
    label = le.inverse_transform([idx])[0]
    probs = {cls: float(p) for cls, p in zip(le.classes_, proba)}
    return label, probs


# ── Sidebar navigation ────────────────────────────────────────────────────────

st.sidebar.markdown("## 🌍 EarthSafe")
st.sidebar.caption("Earthquake Hazard Prediction · STAT 418")
page = st.sidebar.radio("", ["Live Prediction", "Global Activity"], label_visibility="collapsed")
st.sidebar.divider()


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — Live Prediction
# ══════════════════════════════════════════════════════════════════════════════

if page == "Live Prediction":
    model, le = load_model()

    st.title("⚡ Live Hazard Prediction")
    st.caption("Adjust the sliders — prediction updates instantly.")

    st.sidebar.markdown("### Seismic Parameters")

    magnitude = st.sidebar.slider(
        "Magnitude", min_value=2.0, max_value=9.5, value=4.5, step=0.1,
        help="Richter scale magnitude of the earthquake"
    )
    depth = st.sidebar.slider(
        "Depth (km)", min_value=0, max_value=700, value=30, step=5,
        help="Focal depth in kilometers"
    )
    gap = st.sidebar.slider(
        "Azimuthal Gap (°)", min_value=0, max_value=360, value=120, step=5,
        help="Largest azimuthal gap between stations"
    )
    rms = st.sidebar.slider(
        "RMS (seconds)", min_value=0.0, max_value=2.0, value=0.5, step=0.05,
        help="Root-mean-square travel time residual"
    )
    location_type = st.sidebar.radio(
        "Location Type", options=[0, 1],
        format_func=lambda x: "Inland" if x == 0 else "Offshore",
        horizontal=True,
    )

    label, probs = predict(model, le, magnitude, depth, gap, rms, location_type)
    color = HAZARD_COLOR[label]
    emoji = HAZARD_EMOJI[label]
    bg = HAZARD_BG[label]

    # ── Result card ───────────────────────────────────────────────────────────
    col1, col2 = st.columns([1, 1], gap="large")

    with col1:
        st.markdown(f"""
        <div class="hazard-box" style="background:{bg}; border: 2px solid {color};">
            <div style="color:{color}; font-size:1rem; font-weight:600; letter-spacing:3px; text-transform:uppercase;">
                Hazard Level
            </div>
            <div class="big-label" style="color:{color};">{emoji} {label}</div>
            <div style="color:#888; font-size:0.9rem; margin-top:8px;">
                Confidence: {probs[label]*100:.1f}%
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Probability bars
        st.markdown("**Class Probabilities**")
        for lbl in LABEL_ORDER:
            p = probs[lbl]
            c = HAZARD_COLOR[lbl]
            st.markdown(f'<div class="prob-bar-label">{lbl}</div>', unsafe_allow_html=True)
            st.progress(p, text=f"{p*100:.1f}%")

    with col2:
        # Gauge chart
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=magnitude,
            title={"text": "Magnitude", "font": {"size": 18}},
            gauge={
                "axis": {"range": [2, 9.5], "tickwidth": 1},
                "bar": {"color": color, "thickness": 0.25},
                "steps": [
                    {"range": [2, 4], "color": "#d5f5e3"},
                    {"range": [4, 6], "color": "#fef9e7"},
                    {"range": [6, 9.5], "color": "#fdedec"},
                ],
                "threshold": {
                    "line": {"color": color, "width": 4},
                    "thickness": 0.75,
                    "value": magnitude,
                },
            },
            number={"font": {"color": color, "size": 48}},
        ))
        fig.update_layout(height=300, margin=dict(t=40, b=10, l=20, r=20))
        st.plotly_chart(fig, use_container_width=True)

    # ── Input summary ─────────────────────────────────────────────────────────
    st.divider()
    st.markdown("**Current Input**")
    cols = st.columns(5)
    labels = ["Magnitude", "Depth (km)", "Gap (°)", "RMS (s)", "Location"]
    values = [magnitude, depth, gap, rms, "Offshore" if location_type else "Inland"]
    for col, lbl, val in zip(cols, labels, values):
        col.metric(lbl, val)

    # ── Hazard guide ──────────────────────────────────────────────────────────
    with st.expander("Hazard Level Guide"):
        c1, c2, c3 = st.columns(3)
        c1.success("🟢 **Low** — M < 4.0\nMinor shaking, rarely felt.")
        c2.warning("🟡 **Moderate** — M 4.0–6.0\nFelt widely, possible damage.")
        c3.error("🔴 **High** — M ≥ 6.0\nStrong shaking, significant damage risk.")


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — Global Activity
# ══════════════════════════════════════════════════════════════════════════════

else:
    st.title("🗺️ Global Earthquake Activity")

    st.sidebar.markdown("### Filters")
    hours = st.sidebar.selectbox("Time window", [6, 12, 24, 48, 72], index=2,
                                  format_func=lambda h: f"Last {h} hours")
    min_mag = st.sidebar.slider("Min magnitude", 2.0, 7.0, 2.5, 0.5)
    show_labels = st.sidebar.multiselect(
        "Show hazard levels",
        LABEL_ORDER, default=LABEL_ORDER,
    )

    with st.spinner("Fetching live USGS data..."):
        df = fetch_recent(hours=hours, min_mag=min_mag)

    if df.empty:
        st.error("Could not load USGS data. Check your internet connection.")
        st.stop()

    df_filtered = df[df["hazard_label"].isin(show_labels)]

    # ── Stats row ─────────────────────────────────────────────────────────────
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Events", len(df_filtered))
    m2.metric("🔴 High", len(df_filtered[df_filtered["hazard_label"] == "High"]))
    m3.metric("🟡 Moderate", len(df_filtered[df_filtered["hazard_label"] == "Moderate"]))
    m4.metric("Max Magnitude", f"M{df_filtered['magnitude'].max():.1f}" if not df_filtered.empty else "—")

    st.caption(f"Last updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} · Auto-refreshes every 5 min")

    # ── World map ─────────────────────────────────────────────────────────────
    if not df_filtered.empty:
        df_plot = df_filtered.copy()
        df_plot["size"] = (df_plot["magnitude"] ** 2.5).clip(upper=60)
        df_plot["color"] = df_plot["hazard_label"].map(HAZARD_COLOR)
        df_plot["label_display"] = df_plot["hazard_label"].map(
            lambda x: f"{HAZARD_EMOJI[x]} {x}"
        )
        df_plot["hover"] = (
            "M" + df_plot["magnitude"].astype(str) +
            " · " + df_plot["depth"].astype(str) + " km depth<br>" +
            df_plot["place"]
        )

        fig_map = go.Figure()
        for label in LABEL_ORDER:
            sub = df_plot[df_plot["hazard_label"] == label]
            if sub.empty:
                continue
            fig_map.add_trace(go.Scattergeo(
                lon=sub["longitude"],
                lat=sub["latitude"],
                mode="markers",
                marker=dict(
                    size=sub["size"],
                    color=HAZARD_COLOR[label],
                    opacity=0.75,
                    line=dict(width=0.5, color="white"),
                ),
                text=sub["hover"],
                hovertemplate="%{text}<extra></extra>",
                name=f"{HAZARD_EMOJI[label]} {label}",
            ))

        fig_map.update_layout(
            geo=dict(
                showland=True, landcolor="#1a1a2e",
                showocean=True, oceancolor="#0f3460",
                showcountries=True, countrycolor="#2d2d5e",
                showcoastlines=True, coastlinecolor="#2d2d5e",
                projection_type="natural earth",
                bgcolor="#0a0a1a",
            ),
            paper_bgcolor="#0a0a1a",
            plot_bgcolor="#0a0a1a",
            legend=dict(
                orientation="h", x=0.5, xanchor="center", y=-0.05,
                font=dict(color="white"),
            ),
            margin=dict(t=0, b=0, l=0, r=0),
            height=500,
        )
        st.plotly_chart(fig_map, use_container_width=True)

    # ── Recent earthquakes table ───────────────────────────────────────────────
    st.markdown("### Recent Earthquakes")
    if not df_filtered.empty:
        table_df = df_filtered[["time", "magnitude", "depth", "hazard_label", "place"]].copy()
        table_df["time"] = table_df["time"].dt.strftime("%m-%d %H:%M UTC")
        table_df.columns = ["Time (UTC)", "Magnitude", "Depth (km)", "Hazard", "Location"]
        table_df = table_df.reset_index(drop=True)
        st.dataframe(
            table_df,
            use_container_width=True,
            height=350,
            column_config={
                "Magnitude": st.column_config.NumberColumn(format="M%.1f"),
                "Hazard": st.column_config.TextColumn(width="small"),
            },
        )
    else:
        st.info("No earthquakes match the current filters.")
