const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "EarthSafe — STAT 418 Final Presentation";
pres.author = "Yutong Ma";

// ── Palette (all bright / projection-friendly) ────────────────────────────────
const C = {
  blue:    "1A5276",   // deep blue — headers, titles
  teal:    "0D9488",   // teal — accents, icons
  amber:   "D68910",   // amber — highlights
  low:     "1E8449",   // green
  mod:     "D4800A",   // orange
  high:    "C0392B",   // red
  white:   "FFFFFF",
  bg:      "F7FBFF",   // very light blue-white page bg
  card:    "EAF4FB",   // light blue card fill
  card2:   "E9F7EF",   // light green
  card3:   "FEF9E7",   // light yellow
  card4:   "FDEDEC",   // light red
  text:    "1A1A2A",   // near-black body text
  muted:   "4A6274",   // medium-dark gray
  border:  "B2D8F0",
};

const makeShadow = () => ({
  type: "outer", blur: 10, offset: 3, angle: 135, color: "000000", opacity: 0.10
});

// Header strip used on every content slide
function addHeader(s, title) {
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.85,
    fill: { color: C.blue }, line: { color: C.blue },
  });
  // teal left accent
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 0.85,
    fill: { color: C.teal }, line: { color: C.teal },
  });
  s.addText(title, {
    x: 0.35, y: 0, w: 9.4, h: 0.85,
    fontSize: 30, fontFace: "Trebuchet MS", bold: true,
    color: C.white, valign: "middle",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title  (bright white bg)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  // Top teal bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.22,
    fill: { color: C.teal }, line: { color: C.teal },
  });
  // Bottom blue bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.4, w: 10, h: 0.225,
    fill: { color: C.blue }, line: { color: C.blue },
  });

  // Globe
  s.addText("🌍", {
    x: 3.8, y: 0.5, w: 2.4, h: 1.3,
    fontSize: 64, align: "center",
  });

  // Main title
  s.addText("EarthSafe", {
    x: 0.5, y: 1.75, w: 9, h: 1.15,
    fontSize: 64, fontFace: "Trebuchet MS", bold: true,
    color: C.blue, align: "center",
  });

  // Subtitle
  s.addText("Real-Time Earthquake Hazard Prediction", {
    x: 0.5, y: 2.9, w: 9, h: 0.6,
    fontSize: 26, fontFace: "Calibri", color: C.teal, align: "center",
  });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.5, y: 3.62, w: 3, h: 0.05,
    fill: { color: C.border }, line: { color: C.border },
  });

  // Meta
  s.addText("STAT 418  ·  UCLA  ·  Spring 2026  ·  Yutong Ma", {
    x: 0.5, y: 3.78, w: 9, h: 0.42,
    fontSize: 18, fontFace: "Calibri", color: C.muted, align: "center",
  });

  // App link button
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.6, y: 4.35, w: 3.1, h: 0.55,
    fill: { color: C.teal }, line: { color: C.teal }, rectRadius: 0.08,
  });
  s.addText("🔗  earthsafe-eu9o2sytymwqnls48ppjg7.streamlit.app", {
    x: 1.6, y: 4.35, w: 3.1, h: 0.55,
    fontSize: 10, fontFace: "Calibri", color: C.white,
    align: "center", valign: "middle", margin: 0,
  });

  // API note button
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y: 4.35, w: 3.1, h: 0.55,
    fill: { color: C.amber }, line: { color: C.amber }, rectRadius: 0.08,
  });
  s.addText("⚙️  Flask API  ·  POST /predict  ·  GET /recent", {
    x: 5.3, y: 4.35, w: 3.1, h: 0.55,
    fontSize: 10, fontFace: "Calibri", color: C.white,
    align: "center", valign: "middle", margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Project Overview & Motivation
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Project Overview & Motivation");

  // Left: problem text
  s.addText("The Problem", {
    x: 0.4, y: 1.1, w: 4.8, h: 0.45,
    fontSize: 22, fontFace: "Trebuchet MS", bold: true, color: C.blue,
  });
  s.addText(
    "Every year ~55,000 earthquakes of M≥2.5 occur globally. " +
    "USGS publishes the data in real time — but it's raw, " +
    "technical numbers that most people cannot act on.\n\n" +
    "EarthSafe translates seismic parameters into a clear " +
    "hazard level: Low, Moderate, or High.",
    {
      x: 0.4, y: 1.6, w: 4.8, h: 1.7,
      fontSize: 17, fontFace: "Calibri", color: C.text,
    }
  );

  // Stat boxes
  const stats = [
    { val: "55,000+", lbl: "M≥2.5 quakes\nper year (global)" },
    { val: "2,000",   lbl: "records collected\nUSGS 2023-2024" },
    { val: "5",       lbl: "input features\nfor prediction" },
  ];
  stats.forEach((st, i) => {
    const bx = 0.38 + i * 1.68;
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: 3.4, w: 1.52, h: 1.15,
      fill: { color: C.card }, line: { color: C.border }, shadow: makeShadow(),
    });
    s.addText(st.val, {
      x: bx, y: 3.44, w: 1.52, h: 0.58,
      fontSize: 22, fontFace: "Trebuchet MS", bold: true,
      color: C.blue, align: "center",
    });
    s.addText(st.lbl, {
      x: bx, y: 4.0, w: 1.52, h: 0.48,
      fontSize: 11, fontFace: "Calibri", color: C.muted, align: "center",
    });
  });

  // Right: hazard level cards
  s.addText("Hazard Levels", {
    x: 5.5, y: 1.1, w: 4.1, h: 0.45,
    fontSize: 22, fontFace: "Trebuchet MS", bold: true, color: C.blue,
  });

  const levels = [
    { label: "🟢  Low",      range: "Magnitude < 4.0",   desc: "Minor shaking, rarely felt",       color: C.low,  bg: "E9F7EF" },
    { label: "🟡  Moderate", range: "Magnitude 4.0–6.0", desc: "Widely felt, possible minor damage", color: C.mod,  bg: C.card3  },
    { label: "🔴  High",     range: "Magnitude ≥ 6.0",   desc: "Strong shaking, significant damage", color: C.high, bg: "FDEDEC" },
  ];
  levels.forEach((lv, i) => {
    const by = 1.62 + i * 1.28;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.4, y: by, w: 4.2, h: 1.1,
      fill: { color: lv.bg }, line: { color: lv.color }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.4, y: by, w: 0.14, h: 1.1,
      fill: { color: lv.color }, line: { color: lv.color },
    });
    s.addText(lv.label, {
      x: 5.65, y: by + 0.1, w: 3.85, h: 0.38,
      fontSize: 17, fontFace: "Trebuchet MS", bold: true, color: lv.color,
    });
    s.addText(lv.range + "  ·  " + lv.desc, {
      x: 5.65, y: by + 0.54, w: 3.85, h: 0.44,
      fontSize: 14, fontFace: "Calibri", color: C.text,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Data Collection & Preprocessing
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Data Collection & Preprocessing");

  // Left: pipeline steps
  s.addText("Data Pipeline", {
    x: 0.4, y: 1.0, w: 4.6, h: 0.45,
    fontSize: 20, fontFace: "Trebuchet MS", bold: true, color: C.blue,
  });

  const steps = [
    { n: "01", title: "USGS API Fetch",       detail: "Monthly chunks · M≥2.5 · 2023–2024 · 2,000 records" },
    { n: "02", title: "Feature Engineering",  detail: "location_type from place text · impute gap (103 nulls with median)" },
    { n: "03", title: "Hazard Labeling",      detail: "Rule-based: Low <4.0 · Moderate 4–6 · High ≥6.0" },
    { n: "04", title: "Stratified CV Split",  detail: "5-fold cross-validation, stratified by hazard class" },
  ];
  steps.forEach((st, i) => {
    const sy = 1.55 + i * 0.94;
    s.addShape(pres.shapes.OVAL, {
      x: 0.35, y: sy, w: 0.55, h: 0.55,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    s.addText(st.n, {
      x: 0.35, y: sy, w: 0.55, h: 0.55,
      fontSize: 14, fontFace: "Trebuchet MS", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.title, {
      x: 1.06, y: sy + 0.02, w: 3.85, h: 0.28,
      fontSize: 15, fontFace: "Trebuchet MS", bold: true, color: C.blue,
    });
    s.addText(st.detail, {
      x: 1.06, y: sy + 0.3, w: 3.85, h: 0.3,
      fontSize: 13, fontFace: "Calibri", color: C.muted,
    });
  });

  // Right: pie chart
  s.addText("Class Distribution", {
    x: 5.5, y: 1.0, w: 4.1, h: 0.45,
    fontSize: 20, fontFace: "Trebuchet MS", bold: true, color: C.blue,
  });

  s.addChart(pres.charts.PIE, [{
    name: "Hazard Label",
    labels: ["Low (M<4.0)", "Moderate (4.0-6.0)", "High (M>=6.0)"],
    values: [1033, 960, 7],
  }], {
    x: 5.1, y: 1.48, w: 4.6, h: 3.1,
    chartColors: [C.low, C.mod, C.high],
    showPercent: true,
    showLegend: true,
    legendPos: "b",
    legendFontSize: 13,
    dataLabelFontSize: 14,
    dataLabelColor: C.white,
    chartArea: { fill: { color: C.white } },
  });

  // Imbalance note
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 4.72, w: 4.6, h: 0.56,
    fill: { color: C.card3 }, line: { color: C.mod },
  });
  s.addText("⚠️  High class: only 7 records (M≥6.0 events are rare). Handled with balanced sample weights in training.", {
    x: 5.2, y: 4.75, w: 4.4, h: 0.5,
    fontSize: 12, fontFace: "Calibri", color: "7D6608",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Model Development & Evaluation
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Model Development & Evaluation");

  // Bar chart (left)
  s.addChart(pres.charts.BAR, [
    {
      name: "Accuracy",
      labels: ["Logistic Regression", "Random Forest", "XGBoost"],
      values: [0.971, 0.999, 0.9995],
    },
    {
      name: "Macro F1",
      labels: ["Logistic Regression", "Random Forest", "XGBoost"],
      values: [0.861, 0.944, 1.000],
    },
  ], {
    x: 0.3, y: 0.95, w: 5.9, h: 3.85, barDir: "col",
    chartColors: [C.blue, C.teal],
    chartArea: { fill: { color: C.white }, roundedCorners: false },
    catAxisLabelColor: C.text,
    catAxisLabelFontSize: 13,
    valAxisLabelColor: C.muted,
    valAxisMinVal: 0.8,
    valAxisMaxVal: 1.05,
    valGridLine: { color: "D5E8F0", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: false,
    showLegend: true,
    legendPos: "t",
    legendFontSize: 13,
    title: "5-Fold Cross-Validation Results",
    showTitle: true,
    titleFontSize: 15,
    titleColor: C.blue,
  });

  // Best Model card (right top)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.45, y: 0.95, w: 3.2, h: 1.9,
    fill: { color: C.card }, line: { color: C.border }, shadow: makeShadow(),
  });
  s.addText("🏆  Best Model", {
    x: 6.55, y: 1.0, w: 3.0, h: 0.42,
    fontSize: 16, fontFace: "Trebuchet MS", bold: true, color: C.blue,
  });
  s.addText("XGBoost", {
    x: 6.55, y: 1.4, w: 3.0, h: 0.58,
    fontSize: 34, fontFace: "Trebuchet MS", bold: true, color: C.teal, align: "center",
  });
  s.addText("Accuracy 99.95%  ·  Macro F1 1.00", {
    x: 6.55, y: 1.96, w: 3.0, h: 0.34,
    fontSize: 12, fontFace: "Calibri", color: C.muted, align: "center",
  });
  s.addText("300 trees · depth 6 · lr 0.05 · sample_weight balanced", {
    x: 6.55, y: 2.28, w: 3.0, h: 0.44,
    fontSize: 11, fontFace: "Calibri", color: C.muted, align: "center", italic: true,
  });

  // Feature importance (right bottom)
  s.addText("Feature Importance", {
    x: 6.45, y: 3.05, w: 3.2, h: 0.4,
    fontSize: 16, fontFace: "Trebuchet MS", bold: true, color: C.blue,
  });

  const feats = [
    { name: "magnitude",     val: 0.82 },
    { name: "depth",         val: 0.07 },
    { name: "gap",           val: 0.05 },
    { name: "rms",           val: 0.04 },
    { name: "location_type", val: 0.02 },
  ];
  feats.forEach((f, i) => {
    const fy = 3.52 + i * 0.38;
    s.addText(f.name, {
      x: 6.45, y: fy, w: 1.35, h: 0.3,
      fontSize: 12, fontFace: "Calibri", color: C.text, align: "right",
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.88, y: fy + 0.06, w: f.val * 1.52, h: 0.2,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    s.addText(`${Math.round(f.val * 100)}%`, {
      x: 7.88 + f.val * 1.52 + 0.06, y: fy, w: 0.4, h: 0.3,
      fontSize: 11, fontFace: "Calibri", color: C.muted,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Solution Architecture
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Solution Architecture");

  s.addImage({
    path: path.resolve(__dirname, "data/processed/fig_architecture.png"),
    x: 0.25, y: 0.95, w: 9.5, h: 3.65,
  });

  // Tech chips
  const chips = ["Python 3.11", "XGBoost 2.0", "Flask 3.0", "Streamlit 1.35", "Plotly 5.20", "Docker", "Cloud Run"];
  const chipW = 1.22;
  const gap = 0.1;
  const totalW = chips.length * chipW + (chips.length - 1) * gap;
  const startX = (10 - totalW) / 2;
  chips.forEach((chip, i) => {
    const cx = startX + i * (chipW + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: cx, y: 4.82, w: chipW, h: 0.42,
      fill: { color: C.blue }, line: { color: C.blue }, rectRadius: 0.06,
    });
    s.addText(chip, {
      x: cx, y: 4.82, w: chipW, h: 0.42,
      fontSize: 11, fontFace: "Calibri", color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — App Features & Live Demo
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "App Features & Live Demo");

  const features = [
    {
      icon: "🎚️", title: "Interactive Sliders",
      desc: "Drag magnitude, depth, gap, RMS, location type — hazard level updates instantly",
      color: C.teal, bg: "E0F5F2",
    },
    {
      icon: "🗺️", title: "Live Earthquake Map",
      desc: "Plotly globe with live USGS data, color-coded by hazard, auto-refreshes every 5 min",
      color: C.blue, bg: C.card,
    },
    {
      icon: "📊", title: "Probability Display",
      desc: "Confidence scores for each class, progress bars, magnitude gauge chart",
      color: C.amber, bg: C.card3,
    },
    {
      icon: "⚡", title: "Flask REST API",
      desc: "POST /predict returns hazard_label, probabilities, hex color in JSON",
      color: "7D3C98", bg: "F4ECF7",
    },
    {
      icon: "🌐", title: "USGS Live Proxy",
      desc: "GET /recent fetches last 24h earthquakes in real time for the map feed",
      color: C.low, bg: "E9F7EF",
    },
    {
      icon: "🐳", title: "Docker + Cloud Run",
      desc: "Containerised, serverless deployment — app stays live June 2 to June 9",
      color: C.high, bg: "FDEDEC",
    },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = 0.28 + col * 3.24;
    const by = 1.02 + row * 2.2;

    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by, w: 3.08, h: 2.0,
      fill: { color: f.bg }, line: { color: f.color }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by, w: 3.08, h: 0.09,
      fill: { color: f.color }, line: { color: f.color },
    });

    s.addText(f.icon, {
      x: bx + 0.08, y: by + 0.16, w: 0.7, h: 0.6,
      fontSize: 24, align: "center",
    });
    s.addText(f.title, {
      x: bx + 0.82, y: by + 0.16, w: 2.14, h: 0.6,
      fontSize: 15, fontFace: "Trebuchet MS", bold: true, color: f.color, valign: "middle",
    });
    s.addText(f.desc, {
      x: bx + 0.14, y: by + 0.82, w: 2.82, h: 1.08,
      fontSize: 13, fontFace: "Calibri", color: C.text,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Challenges, Learnings & Future Work  (bright, 3 columns)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Challenges, Learnings & Future Work");

  const cols = [
    {
      icon: "⚡", title: "Challenges", color: C.high, bg: "FDEDEC", borderBg: "F5B7B1",
      items: [
        "Severe class imbalance — only 7 High-hazard events in 2,000 records",
        "macOS port 5000 blocked by AirPlay — migrated Flask API to port 5001",
        "XGBoost requires brew install libomp on macOS for OpenMP support",
        "USGS 20k/request limit — solved with monthly chunk fetching",
      ],
    },
    {
      icon: "💡", title: "Learnings", color: C.teal, bg: "E0F5F2", borderBg: "A2D9CE",
      items: [
        "Full MLOps pipeline in one project: collect → train → API → UI → cloud",
        "Macro F1 is the right metric for imbalanced multiclass, not accuracy",
        "Docker health checks + depends_on for reliable multi-service startup",
        "XGBoost sample_weight more robust than class_weight for rare classes",
      ],
    },
    {
      icon: "🚀", title: "Future Work", color: C.blue, bg: C.card, borderBg: C.border,
      items: [
        "Add temporal features — aftershock sequences, time since last event",
        "USGS WebSocket feed for sub-second real-time map updates",
        "Expand to regression: predict magnitude from early seismic signals",
        "Geospatial clustering — fault line proximity as an engineered feature",
      ],
    },
  ];

  cols.forEach((col, i) => {
    const cx = 0.28 + i * 3.24;

    // Column header
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 1.0, w: 3.08, h: 0.58,
      fill: { color: col.color }, line: { color: col.color },
    });
    s.addText(`${col.icon}  ${col.title}`, {
      x: cx, y: 1.0, w: 3.08, h: 0.58,
      fontSize: 18, fontFace: "Trebuchet MS", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    // Items
    col.items.forEach((item, j) => {
      const iy = 1.66 + j * 0.88;
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: iy, w: 3.08, h: 0.78,
        fill: { color: col.bg }, line: { color: col.borderBg }, shadow: makeShadow(),
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: iy, w: 0.1, h: 0.78,
        fill: { color: col.color }, line: { color: col.color },
      });
      s.addText(item, {
        x: cx + 0.18, y: iy + 0.06, w: 2.8, h: 0.66,
        fontSize: 12, fontFace: "Calibri", color: C.text, valign: "middle",
      });
    });
  });

  // Footer
  s.addText("EarthSafe  ·  STAT 418  ·  Yutong Ma  ·  UCLA Spring 2026", {
    x: 0.4, y: 5.38, w: 9.2, h: 0.2,
    fontSize: 11, fontFace: "Calibri", color: C.muted, align: "center",
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "EarthSafe_Final_Presentation.pptx" })
  .then(() => console.log("Saved: EarthSafe_Final_Presentation.pptx"))
  .catch(err => { console.error(err); process.exit(1); });
