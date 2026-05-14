"""Generate EarthSafe architecture diagram — 2-row layout, large text."""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
from pathlib import Path

OUTPUT = Path(__file__).parents[1] / "data" / "processed" / "fig_architecture.png"

# ── Colors ────────────────────────────────────────────────────────────────────
BG      = "#FFFFFF"
C_DATA  = "#2980B9"   # blue
C_MODEL = "#8E44AD"   # purple
C_API   = "#D35400"   # orange
C_APP   = "#1E8449"   # green
C_CLOUD = "#C0392B"   # red
C_ARROW = "#2C3E50"   # dark arrow
C_LABEL = "#2C3E50"   # dark label text
C_SUB   = "#5D6D7E"   # subtitle under box

BOX_W = 2.6
BOX_H = 1.1
FONT_TITLE  = 14
FONT_SUB    = 11
FONT_STEP   = 12
FONT_ARROW  = 11


def box(ax, x, y, title, sub, color):
    rect = FancyBboxPatch(
        (x - BOX_W / 2, y - BOX_H / 2), BOX_W, BOX_H,
        boxstyle="round,pad=0.06",
        facecolor=color, edgecolor="white", linewidth=2, alpha=0.93, zorder=3,
    )
    ax.add_patch(rect)
    ax.text(x, y + 0.18, title,
            ha="center", va="center",
            fontsize=FONT_TITLE, fontweight="bold", color="white", zorder=4)
    ax.text(x, y - 0.24, sub,
            ha="center", va="center",
            fontsize=FONT_SUB, color="white", alpha=0.92, zorder=4)


def h_arrow(ax, x1, x2, y, label=""):
    """Horizontal arrow with label above."""
    ax.annotate("", xy=(x2 - BOX_W / 2 - 0.05, y),
                xytext=(x1 + BOX_W / 2 + 0.05, y),
                arrowprops=dict(arrowstyle="-|>", color=C_ARROW,
                                lw=2.0, mutation_scale=16), zorder=2)
    if label:
        mx = (x1 + x2) / 2
        ax.text(mx, y + 0.28, label,
                ha="center", va="bottom",
                fontsize=FONT_ARROW, color=C_LABEL, fontweight="bold")


def v_arrow(ax, x, y1, y2, label=""):
    """Vertical (down) arrow."""
    ax.annotate("", xy=(x, y2 + BOX_H / 2 + 0.05),
                xytext=(x, y1 - BOX_H / 2 - 0.05),
                arrowprops=dict(arrowstyle="-|>", color=C_ARROW,
                                lw=2.0, mutation_scale=16), zorder=2)
    if label:
        ax.text(x + 0.22, (y1 + y2) / 2, label,
                ha="left", va="center",
                fontsize=FONT_ARROW, color=C_LABEL, fontweight="bold")


# ── Layout: 2 rows ────────────────────────────────────────────────────────────
#  Row 1 (top):   USGS API → Data Layer → XGBoost
#  Row 2 (bottom): Flask API → Streamlit → Cloud Run
#  Vertical arrow: XGBoost → Flask API

fig, ax = plt.subplots(figsize=(13, 6.5))
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 13)
ax.set_ylim(0, 6.5)
ax.axis("off")

# Title
ax.text(6.5, 6.1, "EarthSafe — System Architecture",
        ha="center", va="center",
        fontsize=18, fontweight="bold", color="#1A5276")

# ── Row positions ─────────────────────────────────────────────────────────────
Y1 = 4.2   # top row
Y2 = 2.0   # bottom row

# Row 1 x-positions (3 boxes spaced evenly across ~11 units)
X1 = [2.2, 6.5, 10.8]
# Row 2 x-positions (3 boxes, same spacing)
X2 = [2.2, 6.5, 10.8]

# ── Row 1 boxes ───────────────────────────────────────────────────────────────
box(ax, X1[0], Y1, "USGS API",    "Earthquake data  M≥2.5", C_DATA)
box(ax, X1[1], Y1, "Data Layer",  "collect.py · preprocess.py",  C_DATA)
box(ax, X1[2], Y1, "XGBoost",     "train.py · Low / Mod / High",  C_MODEL)

# ── Row 2 boxes ───────────────────────────────────────────────────────────────
box(ax, X2[0], Y2, "Flask API",   "POST /predict · GET /recent",  C_API)
box(ax, X2[1], Y2, "Streamlit",   "Sliders · Map · Live predict",  C_APP)
box(ax, X2[2], Y2, "Cloud Run",   "Docker · Serverless · GCP",   C_CLOUD)

# ── Row 1 arrows ──────────────────────────────────────────────────────────────
h_arrow(ax, X1[0], X1[1], Y1, "2,000 records")
h_arrow(ax, X1[1], X1[2], Y1, "features")

# ── XGBoost → Flask API (diagonal) ───────────────────────────────────────────
ax.annotate("",
    xy=(X2[0] + BOX_W / 2 + 0.05, Y2),
    xytext=(X1[2] - BOX_W / 2 - 0.05, Y1),
    arrowprops=dict(arrowstyle="-|>", color=C_ARROW,
                    lw=2.0, mutation_scale=16), zorder=2)
mid_y = (Y1 + Y2) / 2

# ── Row 2 arrows ──────────────────────────────────────────────────────────────
h_arrow(ax, X2[0], X2[1], Y2, "JSON prediction")
h_arrow(ax, X2[1], X2[2], Y2, "Docker image")

# ── Step labels ───────────────────────────────────────────────────────────────
steps = [
    (X1[0], Y1 - BOX_H / 2 - 0.3, "① Ingest"),
    (X1[1], Y1 - BOX_H / 2 - 0.3, "② Process"),
    (X1[2], Y1 - BOX_H / 2 - 0.3, "③ Train"),
    (X2[0], Y2 - BOX_H / 2 - 0.3, "④ Serve"),
    (X2[1], Y2 - BOX_H / 2 - 0.3, "⑤ Visualize"),
    (X2[2], Y2 - BOX_H / 2 - 0.3, "⑥ Deploy"),
]
for sx, sy, lbl in steps:
    ax.text(sx, sy, lbl, ha="center", va="center",
            fontsize=FONT_STEP, color=C_LABEL,
            style="italic", fontweight="bold")

plt.tight_layout(pad=0.3)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
plt.savefig(OUTPUT, dpi=150, bbox_inches="tight", facecolor=BG)
print(f"Saved → {OUTPUT}")
plt.show()
