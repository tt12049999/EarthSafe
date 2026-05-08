"""Generate EarthSafe architecture diagram."""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from pathlib import Path

OUTPUT = Path(__file__).parents[1] / "data" / "processed" / "fig_architecture.png"

# ── Color palette ─────────────────────────────────────────────────────────────
C_DATA   = "#3498db"   # blue
C_MODEL  = "#9b59b6"   # purple
C_API    = "#e67e22"   # orange
C_APP    = "#27ae60"   # green
C_DEPLOY = "#e74c3c"   # red
C_BG     = "#1a1a2e"
C_CARD   = "#16213e"
C_TEXT   = "#ecf0f1"
C_ARROW  = "#7f8c8d"

def box(ax, x, y, w, h, label, sublabel, color, fontsize=10):
    rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle="round,pad=0.04",
                          facecolor=color, edgecolor="white",
                          linewidth=1.5, alpha=0.9, zorder=3)
    ax.add_patch(rect)
    ax.text(x, y + 0.04, label, ha="center", va="center",
            fontsize=fontsize, fontweight="bold", color="white", zorder=4)
    if sublabel:
        ax.text(x, y - 0.09, sublabel, ha="center", va="center",
                fontsize=7.5, color="white", alpha=0.8, zorder=4)

def arrow(ax, x1, x2, y, label=""):
    ax.annotate("", xy=(x2, y), xytext=(x1, y),
                arrowprops=dict(arrowstyle="-|>", color=C_ARROW,
                                lw=1.8, mutation_scale=14), zorder=2)
    if label:
        ax.text((x1+x2)/2, y + 0.22, label, ha="center", va="bottom",
                fontsize=7, color=C_ARROW)

fig, ax = plt.subplots(figsize=(14, 5))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)
ax.set_xlim(0, 14)
ax.set_ylim(0, 5)
ax.axis("off")

# Title
ax.text(7, 4.6, "EarthSafe — System Architecture",
        ha="center", va="center", fontsize=15, fontweight="bold", color=C_TEXT)

# Row y
Y = 2.5

# ── Nodes ─────────────────────────────────────────────────────────────────────
box(ax, 1.2, Y, 1.8, 0.75, "USGS API",    "Earthquake data\n(M≥2.5)",      C_DATA)
box(ax, 3.3, Y, 1.8, 0.75, "Data Layer",  "collect.py\npreprocess.py",     C_DATA)
box(ax, 5.4, Y, 1.8, 0.75, "XGBoost",     "train.py\nLow/Mod/High",        C_MODEL)
box(ax, 7.5, Y, 1.8, 0.75, "Flask API",   "POST /predict\nGET /recent",    C_API)
box(ax, 9.6, Y, 1.8, 0.75, "Streamlit",   "Sliders · Map\nLive prediction", C_APP)
box(ax, 11.7,Y, 1.8, 0.75, "Cloud Run",   "Flask + Streamlit\nDocker",      C_DEPLOY)

# ── Arrows ────────────────────────────────────────────────────────────────────
arrow(ax, 2.1,  2.4,  Y, "2,000 records")
arrow(ax, 4.2,  4.5,  Y, "features")
arrow(ax, 6.3,  6.6,  Y, "model.pkl")
arrow(ax, 8.4,  8.7,  Y, "JSON")
arrow(ax, 10.5, 10.8, Y, "deploy")

# ── Bottom labels ─────────────────────────────────────────────────────────────
stages = [
    (1.2,  "① Ingest"),
    (3.3,  "② Process"),
    (5.4,  "③ Train"),
    (7.5,  "④ Serve"),
    (9.6,  "⑤ Visualize"),
    (11.7, "⑥ Deploy"),
]
for x, lbl in stages:
    ax.text(x, 1.85, lbl, ha="center", va="center",
            fontsize=8.5, color=C_ARROW, style="italic")

# ── Tech tags ──────────────────────────────────────────────────────────────────
tags = [
    (1.2,  3.1,  "requests"),
    (3.3,  3.1,  "pandas · sklearn"),
    (5.4,  3.1,  "XGBoost"),
    (7.5,  3.1,  "Flask · Flask-CORS"),
    (9.6,  3.1,  "Streamlit · Plotly"),
    (11.7, 3.1,  "Docker · GCP"),
]
for x, y, tag in tags:
    ax.text(x, y, tag, ha="center", va="center",
            fontsize=7, color=C_TEXT, alpha=0.6,
            bbox=dict(facecolor=C_CARD, edgecolor="none", boxstyle="round,pad=0.2"))

plt.tight_layout()
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
plt.savefig(OUTPUT, dpi=150, bbox_inches="tight", facecolor=C_BG)
print(f"Saved → {OUTPUT}")
plt.show()
