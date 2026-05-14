const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "EarthSafe — STAT 418 Final Presentation";
pres.author = "Yutong Ma";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy:    "1E3A5F",
  blue:    "065A82",
  teal:    "0D9488",
  amber:   "E67E22",
  low:     "27AE60",
  mod:     "F39C12",
  high:    "E74C3C",
  white:   "FFFFFF",
  offwhite:"F4F8FB",
  light:   "E8F4FD",
  text:    "1A1A2A",
  muted:   "64748B",
};

const makeShadow = () => ({ type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.10 });

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Big teal accent block on left edge
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });

  // Globe icon circle
  s.addShape(pres.shapes.OVAL, { x: 1.1, y: 0.7, w: 1.1, h: 1.1, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("🌍", { x: 1.1, y: 0.72, w: 1.1, h: 1.1, fontSize: 34, align: "center", valign: "middle" });

  // Main title
  s.addText("EarthSafe", {
    x: 0.5, y: 1.95, w: 9, h: 1.1,
    fontSize: 58, fontFace: "Trebuchet MS", bold: true,
    color: C.white, align: "center",
  });

  // Subtitle
  s.addText("Real-Time Earthquake Hazard Prediction", {
    x: 0.5, y: 3.1, w: 9, h: 0.55,
    fontSize: 22, fontFace: "Calibri", color: "A8D8EA", align: "center",
  });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, { x: 3.2, y: 3.78, w: 3.6, h: 0.04, fill: { color: C.teal }, line: { color: C.teal } });

  // Meta row
  s.addText("STAT 418  ·  UCLA  ·  Spring 2026  ·  Yutong Ma", {
    x: 0.5, y: 3.95, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: "A0B4C8", align: "center",
  });

  // Link placeholders
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.8, y: 4.6, w: 2.8, h: 0.5, fill: { color: C.teal }, line: { color: C.teal }, rectRadius: 0.08 });
  s.addText("🔗  earthsafe-eu9o2sytymwqnls48ppjg7.streamlit.app", { x: 1.8, y: 4.6, w: 2.8, h: 0.5, fontSize: 9.5, color: C.white, align: "center", valign: "middle", margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.4, y: 4.6, w: 2.8, h: 0.5, fill: { color: C.amber }, line: { color: C.amber }, rectRadius: 0.08 });
  s.addText("⚙️  API: Flask · POST /predict  (local / Cloud Run)", { x: 5.4, y: 4.6, w: 2.8, h: 0.5, fontSize: 9.5, color: C.white, align: "center", valign: "middle", margin: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Project Overview & Motivation
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  // Header band
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.78, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("Project Overview & Motivation", {
    x: 0.4, y: 0, w: 9.2, h: 0.78,
    fontSize: 26, fontFace: "Trebuchet MS", bold: true, color: C.white, valign: "middle",
  });

  // Left column — problem + facts
  s.addText("The Problem", { x: 0.4, y: 1.05, w: 4.6, h: 0.4, fontSize: 18, fontFace: "Trebuchet MS", bold: true, color: C.navy });
  s.addText([
    { text: "Earthquakes kill thousands yearly, yet hazard information is buried in raw seismic data — not accessible to the public in real time.", options: { breakLine: true } },
    { text: "\nEarthSafe bridges that gap with a plain-language hazard indicator anyone can understand.", options: {} },
  ], { x: 0.4, y: 1.5, w: 4.5, h: 1.6, fontSize: 13, fontFace: "Calibri", color: C.text });

  // Stat callouts — left
  const stats = [
    { val: "~55,000", lbl: "M>=2.5 earthquakes\nper year globally" },
    { val: "2,000",   lbl: "records collected\n(USGS 2023-2024)" },
    { val: "5",       lbl: "input features\nfor prediction" },
  ];
  stats.forEach((st, i) => {
    const bx = 0.35 + i * 1.65;
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: 3.28, w: 1.52, h: 1.1, fill: { color: C.light }, line: { color: "C5DFF0" }, shadow: makeShadow() });
    s.addText(st.val, { x: bx, y: 3.3, w: 1.52, h: 0.55, fontSize: 22, fontFace: "Trebuchet MS", bold: true, color: C.blue, align: "center" });
    s.addText(st.lbl, { x: bx, y: 3.82, w: 1.52, h: 0.52, fontSize: 9, fontFace: "Calibri", color: C.muted, align: "center" });
  });

  // Right column — hazard cards
  s.addText("Hazard Levels", { x: 5.6, y: 1.05, w: 4.0, h: 0.4, fontSize: 18, fontFace: "Trebuchet MS", bold: true, color: C.navy });

  const levels = [
    { label: "🟢  Low",      range: "Magnitude < 4.0",   desc: "Minor shaking, rarely felt",         color: C.low,  bg: "EAFAF1" },
    { label: "🟡  Moderate", range: "Magnitude 4.0–6.0", desc: "Felt widely, possible minor damage",  color: C.mod,  bg: "FEF9E7" },
    { label: "🔴  High",     range: "Magnitude ≥ 6.0",   desc: "Strong shaking, significant damage",  color: C.high, bg: "FDEDEC" },
  ];
  levels.forEach((lv, i) => {
    const by = 1.52 + i * 1.3;
    s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: by, w: 4.1, h: 1.1, fill: { color: lv.bg }, line: { color: lv.color }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: by, w: 0.12, h: 1.1, fill: { color: lv.color }, line: { color: lv.color } });
    s.addText(lv.label, { x: 5.72, y: by + 0.08, w: 3.8, h: 0.38, fontSize: 15, fontFace: "Trebuchet MS", bold: true, color: lv.color });
    s.addText(lv.range,  { x: 5.72, y: by + 0.44, w: 3.8, h: 0.28, fontSize: 11, fontFace: "Calibri", color: C.text });
    s.addText(lv.desc,   { x: 5.72, y: by + 0.7,  w: 3.8, h: 0.28, fontSize: 10, fontFace: "Calibri", color: C.muted, italic: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Data Collection & Preprocessing
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.78, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("Data Collection & Preprocessing", {
    x: 0.4, y: 0, w: 9.2, h: 0.78,
    fontSize: 26, fontFace: "Trebuchet MS", bold: true, color: C.white, valign: "middle",
  });

  // Left — pipeline steps
  s.addText("Pipeline", { x: 0.4, y: 1.0, w: 4.6, h: 0.38, fontSize: 18, fontFace: "Trebuchet MS", bold: true, color: C.navy });

  const steps = [
    { n: "01", title: "USGS API Fetch",      detail: "requests library · monthly chunks · M≥2.5 · 2023–2024" },
    { n: "02", title: "Feature Engineering", detail: "location_type from place string · median-impute gap (103 nulls)" },
    { n: "03", title: "Hazard Labeling",     detail: "Low <4.0 · Moderate 4–6 · High ≥6 (rule-based)" },
    { n: "04", title: "Train/Test Split",    detail: "Stratified 80/20 · 5-fold cross-validation" },
  ];
  steps.forEach((st, i) => {
    const sy = 1.48 + i * 0.97;
    s.addShape(pres.shapes.OVAL, { x: 0.35, y: sy, w: 0.52, h: 0.52, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(st.n, { x: 0.35, y: sy, w: 0.52, h: 0.52, fontSize: 12, fontFace: "Trebuchet MS", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s.addText(st.title, { x: 1.0, y: sy, w: 3.8, h: 0.28, fontSize: 13, fontFace: "Trebuchet MS", bold: true, color: C.navy });
    s.addText(st.detail, { x: 1.0, y: sy + 0.27, w: 3.8, h: 0.28, fontSize: 10, fontFace: "Calibri", color: C.muted });
  });

  // Right — class distribution pie chart
  s.addText("Class Distribution", { x: 5.5, y: 1.0, w: 4.1, h: 0.38, fontSize: 18, fontFace: "Trebuchet MS", bold: true, color: C.navy });

  s.addChart(pres.charts.PIE, [{
    name: "Hazard Label",
    labels: ["Low (M<4.0)", "Moderate (4.0-6.0)", "High (M>=6.0)"],
    values: [1033, 960, 7],
  }], {
    x: 5.2, y: 1.45, w: 4.5, h: 3.2,
    chartColors: [C.low, C.mod, C.high],
    showPercent: true,
    showLegend: true,
    legendPos: "b",
    legendFontSize: 11,
    dataLabelFontSize: 12,
    dataLabelColor: C.white,
    chartArea: { fill: { color: C.white } },
  });

  // Note on class imbalance
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 4.8, w: 4.5, h: 0.55, fill: { color: "FEF9E7" }, line: { color: C.mod } });
  s.addText("⚠️  High class has only 7 records (M≥6.0 events are rare). Addressed with class_weight balancing in training.", {
    x: 5.3, y: 4.83, w: 4.3, h: 0.48, fontSize: 9.5, fontFace: "Calibri", color: "7D6608",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Model Development & Evaluation
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.78, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("Model Development & Evaluation", {
    x: 0.4, y: 0, w: 9.2, h: 0.78,
    fontSize: 26, fontFace: "Trebuchet MS", bold: true, color: C.white, valign: "middle",
  });

  // Model comparison chart
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
    x: 0.35, y: 0.9, w: 5.8, h: 3.8, barDir: "col",
    chartColors: [C.blue, C.teal],
    chartArea: { fill: { color: C.white }, roundedCorners: false },
    catAxisLabelColor: C.text,
    valAxisLabelColor: C.muted,
    valAxisMinVal: 0.8,
    valAxisMaxVal: 1.02,
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelFormatCode: "0.0%",
    dataLabelFontSize: 9,
    dataLabelColor: C.text,
    showLegend: true,
    legendPos: "t",
    legendFontSize: 11,
    title: "5-Fold CV Results",
    showTitle: true,
    titleFontSize: 13,
    titleColor: C.navy,
  });

  // Right — winner callout + feature importance
  s.addShape(pres.shapes.RECTANGLE, { x: 6.4, y: 0.9, w: 3.25, h: 1.8, fill: { color: C.light }, line: { color: "C5DFF0" }, shadow: makeShadow() });
  s.addText("🏆  Best Model", { x: 6.5, y: 0.95, w: 3.0, h: 0.38, fontSize: 14, fontFace: "Trebuchet MS", bold: true, color: C.navy });
  s.addText("XGBoost", { x: 6.5, y: 1.32, w: 3.0, h: 0.52, fontSize: 30, fontFace: "Trebuchet MS", bold: true, color: C.teal, align: "center" });
  s.addText("Accuracy 99.95%  ·  Macro F1 1.00", { x: 6.5, y: 1.82, w: 3.0, h: 0.28, fontSize: 10, fontFace: "Calibri", color: C.muted, align: "center" });
  s.addText("300 trees · depth 6 · LR 0.05\nsample_weight balanced", { x: 6.5, y: 2.1, w: 3.0, h: 0.42, fontSize: 9.5, fontFace: "Calibri", color: C.muted, align: "center", italic: true });

  // Feature importance mini-bar (horizontal)
  s.addText("Feature Importance (XGBoost)", { x: 6.4, y: 2.98, w: 3.25, h: 0.35, fontSize: 12, fontFace: "Trebuchet MS", bold: true, color: C.navy });

  const feats = [
    { name: "magnitude",     val: 0.82 },
    { name: "depth",         val: 0.07 },
    { name: "gap",           val: 0.05 },
    { name: "rms",           val: 0.04 },
    { name: "location_type", val: 0.02 },
  ];
  feats.forEach((f, i) => {
    const fy = 3.38 + i * 0.38;
    s.addText(f.name, { x: 6.4, y: fy, w: 1.3, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.text, align: "right" });
    s.addShape(pres.shapes.RECTANGLE, { x: 7.78, y: fy + 0.05, w: f.val * 1.7, h: 0.2, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(`${Math.round(f.val * 100)}%`, { x: 7.78 + f.val * 1.7 + 0.05, y: fy, w: 0.45, h: 0.3, fontSize: 9, color: C.muted });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Solution Architecture
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.78, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("Solution Architecture", {
    x: 0.4, y: 0, w: 9.2, h: 0.78,
    fontSize: 26, fontFace: "Trebuchet MS", bold: true, color: C.white, valign: "middle",
  });

  // Architecture diagram image
  s.addImage({
    path: path.resolve(__dirname, "data/processed/fig_architecture.png"),
    x: 0.3, y: 0.9, w: 9.4, h: 3.6,
  });

  // Tech stack chips at bottom
  const chips = ["Python 3.11", "XGBoost 2.0", "Flask 3.0", "Streamlit 1.35", "Plotly 5.20", "Docker", "Google Cloud Run"];
  const chipW = 1.2;
  const totalW = chips.length * chipW + (chips.length - 1) * 0.12;
  const startX = (10 - totalW) / 2;
  chips.forEach((chip, i) => {
    const cx = startX + i * (chipW + 0.12);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: 4.78, w: chipW, h: 0.38, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.06 });
    s.addText(chip, { x: cx, y: 4.78, w: chipW, h: 0.38, fontSize: 9, fontFace: "Calibri", color: C.white, align: "center", valign: "middle", margin: 0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — App Features + Live Demo
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.78, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("App Features & Live Demo", {
    x: 0.4, y: 0, w: 9.2, h: 0.78,
    fontSize: 26, fontFace: "Trebuchet MS", bold: true, color: C.white, valign: "middle",
  });

  const features = [
    {
      icon: "🎚️", title: "Interactive Sliders",
      desc: "Drag magnitude, depth, gap, RMS, location type — hazard level updates instantly without page reload",
      color: C.teal, bg: "E8F8F5",
    },
    {
      icon: "🗺️", title: "Live Earthquake Map",
      desc: "Plotly world map with live USGS data — color-coded by hazard level, auto-refreshes every 5 min",
      color: C.blue, bg: "EBF5FB",
    },
    {
      icon: "📊", title: "Probability Display",
      desc: "Shows confidence scores for each class with visual progress bars and a magnitude gauge chart",
      color: C.amber, bg: "FEF9E7",
    },
    {
      icon: "⚡", title: "Flask REST API",
      desc: "POST /predict endpoint returns JSON with hazard_label, probabilities, and hex color — ready for integration",
      color: "8E44AD", bg: "F4ECF7",
    },
    {
      icon: "🌐", title: "Live USGS Proxy",
      desc: "GET /recent fetches last 24h earthquakes in real time — feeds the Streamlit map with zero extra setup",
      color: C.low, bg: "EAFAF1",
    },
    {
      icon: "🐳", title: "Containerised Deploy",
      desc: "Docker + Google Cloud Run — scalable, serverless, stays live from June 2 to June 9 for grading",
      color: C.high, bg: "FDEDEC",
    },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = 0.3 + col * 3.22;
    const by = 1.0 + row * 2.18;

    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: 3.0, h: 2.0, fill: { color: f.bg }, line: { color: f.color }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: 3.0, h: 0.08, fill: { color: f.color }, line: { color: f.color } });

    s.addText(f.icon, { x: bx, y: by + 0.14, w: 0.8, h: 0.56, fontSize: 22, align: "center" });
    s.addText(f.title, { x: bx + 0.78, y: by + 0.14, w: 2.1, h: 0.56, fontSize: 13, fontFace: "Trebuchet MS", bold: true, color: f.color, valign: "middle" });
    s.addText(f.desc,  { x: bx + 0.12, y: by + 0.76, w: 2.75, h: 1.14, fontSize: 10, fontFace: "Calibri", color: C.text });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Challenges, Learnings, Future Work
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Teal accent strip
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });

  s.addText("Challenges, Learnings & Future Work", {
    x: 0.5, y: 0.28, w: 9.2, h: 0.56,
    fontSize: 26, fontFace: "Trebuchet MS", bold: true, color: C.white,
  });

  // Three columns
  const cols = [
    {
      icon: "⚡",
      title: "Challenges",
      color: C.high,
      items: [
        "Severe class imbalance — only 7 High events in 2,000 records",
        "macOS port 5000 blocked by AirPlay — migrated API to 5001",
        "XGBoost OpenMP dependency on macOS required brew install libomp",
        "USGS 20k/request limit — solved with monthly chunk fetching",
      ],
    },
    {
      icon: "💡",
      title: "Learnings",
      color: C.teal,
      items: [
        "End-to-end MLOps: data → model → API → UI → cloud in one project",
        "Flask-CORS + Streamlit cache_data for clean frontend/backend separation",
        "Docker multi-service deployment with health check dependencies",
        "XGBoost sample_weight is more robust than class_weight for multiclass imbalance",
      ],
    },
    {
      icon: "🚀",
      title: "Future Work",
      color: C.amber,
      items: [
        "Add temporal features — aftershock sequences and time-since-last event",
        "USGS real-time WebSocket feed for sub-second map updates",
        "Expand to regression: predict magnitude from early signal features",
        "Add geospatial clustering — fault line proximity as a feature",
      ],
    },
  ];

  cols.forEach((col, i) => {
    const cx = 0.48 + i * 3.18;

    // Column header
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 0.98, w: 2.95, h: 0.56, fill: { color: col.color }, line: { color: col.color } });
    s.addText(`${col.icon}  ${col.title}`, {
      x: cx, y: 0.98, w: 2.95, h: 0.56,
      fontSize: 15, fontFace: "Trebuchet MS", bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Items
    col.items.forEach((item, j) => {
      const iy = 1.7 + j * 0.9;
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: iy, w: 2.95, h: 0.82, fill: { color: "1E3A5F" }, line: { color: col.color } });
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: iy, w: 0.07, h: 0.82, fill: { color: col.color }, line: { color: col.color } });
      s.addText(item, {
        x: cx + 0.16, y: iy + 0.06, w: 2.7, h: 0.7,
        fontSize: 9.5, fontFace: "Calibri", color: "D6EAF8", valign: "middle",
      });
    });
  });

  // Footer
  s.addText("EarthSafe  ·  STAT 418  ·  Yutong Ma  ·  UCLA Spring 2026", {
    x: 0.5, y: 5.2, w: 9.2, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: "4A6FA5", align: "center",
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "EarthSafe_Final_Presentation.pptx" })
  .then(() => console.log("Saved: EarthSafe_Final_Presentation.pptx"))
  .catch(err => { console.error(err); process.exit(1); });
