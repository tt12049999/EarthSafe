const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "EarthSafe — STAT 418 Final Presentation";
pres.author = "Yutong Ma";

const C = {
  blue:   "1A5276", teal:  "0D9488", amber: "D68910",
  low:    "1E8449", mod:   "D4800A", high:  "C0392B",
  white:  "FFFFFF", bg:    "F7FBFF", card:  "EAF4FB",
  card2:  "E9F7EF", card3: "FEF9E7", card4: "FDEDEC",
  text:   "1A1A2A", muted: "4A6274", border:"B2D8F0",
  dark:   "1E2B38",
};
const makeShadow = () => ({ type:"outer", blur:10, offset:3, angle:135, color:"000000", opacity:0.10 });

function addHeader(s, title) {
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.85, fill:{color:C.blue}, line:{color:C.blue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.18, h:0.85, fill:{color:C.teal}, line:{color:C.teal} });
  s.addText(title, { x:0.35, y:0, w:9.4, h:0.85, fontSize:30, fontFace:"Trebuchet MS", bold:true, color:C.white, valign:"middle" });
}

// ── SLIDE 1 ───────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.22, fill:{color:C.teal}, line:{color:C.teal} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:5.4, w:10, h:0.225, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText("🌍", { x:3.8, y:0.5, w:2.4, h:1.3, fontSize:64, align:"center" });
  s.addText("EarthSafe", { x:0.5, y:1.75, w:9, h:1.15, fontSize:64, fontFace:"Trebuchet MS", bold:true, color:C.blue, align:"center" });
  s.addText("Real-Time Earthquake Hazard Prediction", { x:0.5, y:2.88, w:9, h:0.7, fontSize:26, fontFace:"Trebuchet MS", color:C.teal, align:"center" });
  s.addShape(pres.shapes.RECTANGLE, { x:2.2, y:3.65, w:5.6, h:0.04, fill:{color:C.teal}, line:{color:C.teal} });
  s.addText("STAT 418  ·  UCLA  ·  Spring 2026  ·  Yutong Ma", { x:0.5, y:3.78, w:9, h:0.42, fontSize:16, fontFace:"Calibri", color:C.muted, align:"center" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:1.6, y:4.35, w:3.1, h:0.55, fill:{color:C.teal}, line:{color:C.teal}, rectRadius:0.08 });
  s.addText("🔗  earthsafe-eu9o2sytymwqnls48ppjg7.streamlit.app", { x:1.6, y:4.35, w:3.1, h:0.55, fontSize:10, fontFace:"Calibri", color:C.white, align:"center", valign:"middle", margin:0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:5.3, y:4.35, w:3.1, h:0.55, fill:{color:C.amber}, line:{color:C.amber}, rectRadius:0.08 });
  s.addText("⚙️  Flask API  ·  POST /predict  ·  GET /recent", { x:5.3, y:4.35, w:3.1, h:0.55, fontSize:10, fontFace:"Calibri", color:C.white, align:"center", valign:"middle", margin:0 });
}

// ── SLIDE 2 — Project Overview (fixed overlap) ────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Project Overview & Motivation");

  s.addText("The Problem", { x:0.4, y:1.08, w:4.8, h:0.42, fontSize:22, fontFace:"Trebuchet MS", bold:true, color:C.blue });
  s.addText(
    "Every year ~55,000 earthquakes of M≥2.5 occur globally. " +
    "USGS publishes the data in real time — but it's raw, technical numbers most people cannot act on.\n\n" +
    "EarthSafe turns seismic parameters into a clear hazard level: Low, Moderate, or High.",
    { x:0.4, y:1.56, w:4.8, h:1.75, fontSize:15, fontFace:"Calibri", color:C.text }
  );

  // Stat boxes — pushed down to avoid overlap
  const stats = [
    { val:"55,000+", lbl:"M≥2.5 quakes\nper year (global)" },
    { val:"2,000",   lbl:"records collected\nUSGS 2023-2024" },
    { val:"5",       lbl:"input features\nfor prediction" },
  ];
  stats.forEach((st, i) => {
    const bx = 0.38 + i * 1.68;
    s.addShape(pres.shapes.RECTANGLE, { x:bx, y:3.52, w:1.52, h:1.18, fill:{color:C.card}, line:{color:C.border}, shadow:makeShadow() });
    s.addText(st.val, { x:bx, y:3.56, w:1.52, h:0.58, fontSize:22, fontFace:"Trebuchet MS", bold:true, color:C.blue, align:"center" });
    s.addText(st.lbl, { x:bx, y:4.12, w:1.52, h:0.48, fontSize:11, fontFace:"Calibri", color:C.muted, align:"center" });
  });

  // Right: hazard level cards
  s.addText("Hazard Levels", { x:5.5, y:1.08, w:4.1, h:0.42, fontSize:22, fontFace:"Trebuchet MS", bold:true, color:C.blue });
  const levels = [
    { label:"🟢  Low",      range:"Magnitude < 4.0",   desc:"Minor shaking, rarely felt",        color:C.low,  bg:"E9F7EF" },
    { label:"🟡  Moderate", range:"Magnitude 4.0–6.0", desc:"Widely felt, possible minor damage", color:C.mod,  bg:C.card3  },
    { label:"🔴  High",     range:"Magnitude ≥ 6.0",   desc:"Strong shaking, significant damage", color:C.high, bg:"FDEDEC" },
  ];
  levels.forEach((lv, i) => {
    const by = 1.60 + i * 1.28;
    s.addShape(pres.shapes.RECTANGLE, { x:5.4, y:by, w:4.2, h:1.1, fill:{color:lv.bg}, line:{color:lv.color}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x:5.4, y:by, w:0.14, h:1.1, fill:{color:lv.color}, line:{color:lv.color} });
    s.addText(lv.label, { x:5.65, y:by+0.1, w:3.85, h:0.38, fontSize:17, fontFace:"Trebuchet MS", bold:true, color:lv.color });
    s.addText(lv.range + "  ·  " + lv.desc, { x:5.65, y:by+0.54, w:3.85, h:0.44, fontSize:14, fontFace:"Calibri", color:C.text });
  });
}

// ── SLIDE 3 — Data Collection ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Data Collection & Preprocessing");

  s.addText("Data Pipeline", { x:0.4, y:1.0, w:4.6, h:0.45, fontSize:20, fontFace:"Trebuchet MS", bold:true, color:C.blue });
  const steps = [
    { n:"01", title:"USGS API Fetch",      detail:"Monthly chunks · M≥2.5 · 2023–2024 · 2,000 records" },
    { n:"02", title:"Feature Engineering", detail:"location_type from place text · impute gap (103 nulls with median)" },
    { n:"03", title:"Hazard Labeling",     detail:"Rule-based: Low <4.0 · Moderate 4–6 · High ≥6.0" },
    { n:"04", title:"Stratified CV Split", detail:"5-fold cross-validation, stratified by hazard class" },
  ];
  steps.forEach((st, i) => {
    const sy = 1.52 + i * 0.9;
    s.addShape(pres.shapes.OVAL, { x:0.38, y:sy, w:0.58, h:0.58, fill:{color:C.teal}, line:{color:C.teal} });
    s.addText(st.n, { x:0.38, y:sy, w:0.58, h:0.58, fontSize:14, fontFace:"Trebuchet MS", bold:true, color:C.white, align:"center", valign:"middle" });
    s.addText(st.title, { x:1.1, y:sy+0.02, w:3.8, h:0.3, fontSize:15, fontFace:"Trebuchet MS", bold:true, color:C.blue });
    s.addText(st.detail, { x:1.1, y:sy+0.3, w:3.8, h:0.38, fontSize:12, fontFace:"Calibri", color:C.muted });
  });

  s.addText("Class Distribution", { x:5.4, y:1.0, w:4.2, h:0.45, fontSize:20, fontFace:"Trebuchet MS", bold:true, color:C.blue });
  s.addChart(pres.ChartType.pie, [{ name:"Hazard", labels:["Low (M<4.0)","Moderate (4.0-6.0)","High (M>=6.0)"], values:[51.6,48.0,0.4] }], {
    x:5.2, y:1.3, w:4.5, h:3.2,
    showLegend:true, legendPos:"b", legendFontSize:13,
    showValue:true, dataLabelFontSize:14, dataLabelFontBold:true,
    chartColors:["1E8449","D4800A","C0392B"],
  });
  s.addShape(pres.shapes.RECTANGLE, { x:5.2, y:4.58, w:4.5, h:0.72, fill:{color:"FEF9E7"}, line:{color:C.amber} });
  s.addText("⚠️  High class: only 7 records (M≥6.0 events are rare).\nHandled with balanced sample weights in training.", {
    x:5.35, y:4.62, w:4.2, h:0.62, fontSize:13, fontFace:"Calibri", color:C.text,
  });
}

// ── SLIDE 4 — Model Development ───────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Model Development & Evaluation");

  s.addText("5-Fold Cross-Validation Results", { x:0.4, y:1.0, w:5.8, h:0.4, fontSize:16, fontFace:"Trebuchet MS", bold:true, color:C.blue, align:"center" });
  s.addChart(pres.ChartType.bar,
    [
      { name:"Accuracy", labels:["Logistic Regression","Random Forest","XGBoost"], values:[0.971,0.999,0.9995] },
      { name:"Macro F1", labels:["Logistic Regression","Random Forest","XGBoost"], values:[0.861,0.944,1.000]  },
    ],
    { x:0.3, y:1.38, w:6.0, h:3.95, barGrouping:"clustered", chartColors:[C.blue, C.teal], showValue:false,
      valAxisMinVal:0.8, valAxisMaxVal:1.05, catAxisLabelFontSize:13, valAxisLabelFontSize:11,
      showLegend:true, legendPos:"t", legendFontSize:13 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x:6.45, y:1.0, w:3.2, h:1.7, fill:{color:C.card3}, line:{color:C.amber}, shadow:makeShadow() });
  s.addText("🏆  Best Model", { x:6.6, y:1.08, w:2.9, h:0.38, fontSize:15, fontFace:"Trebuchet MS", bold:true, color:C.amber });
  s.addText("XGBoost", { x:6.5, y:1.44, w:3.0, h:0.62, fontSize:30, fontFace:"Trebuchet MS", bold:true, color:C.blue, align:"center" });
  s.addText("Accuracy 99.95%  ·  Macro F1 1.00", { x:6.5, y:2.02, w:3.0, h:0.32, fontSize:13, fontFace:"Calibri", color:C.muted, align:"center" });
  s.addText("300 trees · depth 6 · lr 0.05 · sample_weight balanced", { x:6.5, y:2.32, w:3.0, h:0.28, fontSize:11, fontFace:"Calibri", color:C.muted, align:"center", italic:true });

  s.addText("Feature Importance", { x:6.45, y:3.05, w:3.2, h:0.4, fontSize:16, fontFace:"Trebuchet MS", bold:true, color:C.blue });
  const feats = [
    { name:"magnitude", val:0.82 }, { name:"depth", val:0.07 }, { name:"gap", val:0.05 },
    { name:"rms", val:0.04 },       { name:"location_type", val:0.02 },
  ];
  feats.forEach((f, i) => {
    const fy = 3.52 + i * 0.38;
    s.addText(f.name, { x:6.45, y:fy, w:1.35, h:0.3, fontSize:12, fontFace:"Calibri", color:C.text, align:"right" });
    s.addShape(pres.shapes.RECTANGLE, { x:7.88, y:fy+0.06, w:f.val*1.52, h:0.2, fill:{color:C.teal}, line:{color:C.teal} });
    s.addText(`${Math.round(f.val*100)}%`, { x:7.88+f.val*1.52+0.06, y:fy, w:0.4, h:0.3, fontSize:11, fontFace:"Calibri", color:C.muted });
  });
}

// ── SLIDE 5 — Architecture (fixed proportions, no chip bar) ──────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Solution Architecture");

  // Image natural ratio: 1967:992 ≈ 1.984:1
  // Available: w=9.4, so h = 9.4/1.984 = 4.73"  — fits perfectly in 5.63-0.88=4.75" remaining
  s.addImage({
    path: path.resolve(__dirname, "data/processed/fig_architecture.png"),
    x: 0.3, y: 0.9, w: 9.4, h: 4.74,
  });
}

// ── SLIDE 6 — App Features (icon-list + API panel, no card grid) ──────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "App Features & Live Demo");

  // Left col — 3 app features as clean icon-text rows with dividers
  const appFeatures = [
    { icon:"🎚️", title:"Interactive Sliders",   desc:"Drag magnitude, depth, gap, RMS, location type — hazard level updates instantly",          color:C.teal  },
    { icon:"🗺️", title:"Live Earthquake Map",   desc:"Plotly globe · live USGS data · color-coded by hazard · auto-refreshes every 5 min",       color:C.blue  },
    { icon:"📊", title:"Probability Display",   desc:"Confidence scores for each class + magnitude gauge chart",                                   color:C.amber },
  ];
  appFeatures.forEach((f, i) => {
    const fy = 1.05 + i * 1.38;
    // Colored left accent
    s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:fy, w:0.08, h:1.1, fill:{color:f.color}, line:{color:f.color} });
    // Icon
    s.addText(f.icon, { x:0.48, y:fy+0.04, w:0.66, h:0.55, fontSize:26, align:"center" });
    // Title
    s.addText(f.title, { x:1.18, y:fy+0.06, w:4.0, h:0.44, fontSize:17, fontFace:"Trebuchet MS", bold:true, color:f.color });
    // Description
    s.addText(f.desc, { x:0.48, y:fy+0.56, w:4.7, h:0.52, fontSize:13, fontFace:"Calibri", color:C.text });
    // Divider (not after last)
    if (i < 2) {
      s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:fy+1.18, w:4.9, h:0.02, fill:{color:C.border}, line:{color:C.border} });
    }
  });

  // Right col — API dark panel + tech list
  // Dark header bar
  s.addShape(pres.shapes.RECTANGLE, { x:5.5, y:1.05, w:4.2, h:0.52, fill:{color:"2C3E50"}, line:{color:"2C3E50"} });
  s.addText("⚡  Flask REST API", { x:5.5, y:1.05, w:4.2, h:0.52, fontSize:15, fontFace:"Trebuchet MS", bold:true, color:C.white, valign:"middle", margin:[0,0,0,14] });

  // Code example box
  s.addShape(pres.shapes.RECTANGLE, { x:5.5, y:1.57, w:4.2, h:1.62, fill:{color:C.dark}, line:{color:C.dark} });
  s.addText(
    'POST /predict\n{"magnitude": 7.0, "depth": 10,\n "gap": 90, "rms": 0.3, "location_type": 0}\n\n→ {"hazard_label": "High",\n   "color": "#e74c3c",\n   "probabilities": {...}}',
    { x:5.62, y:1.62, w:3.96, h:1.52, fontSize:11, fontFace:"Courier New", color:"A8D8A8", valign:"top" }
  );

  // 3 tech items below code box
  const techItems = [
    { icon:"🌐", title:"USGS Live Proxy",   desc:"GET /recent — last 24h quakes for the map"     },
    { icon:"🐳", title:"Docker + Cloud Run", desc:"Containerised · serverless · live June 2–9"   },
    { icon:"🔄", title:"Auto-Refresh",       desc:"Map updates every 5 min via cache_data TTL"   },
  ];
  techItems.forEach((t, i) => {
    const ty = 3.32 + i * 0.72;
    s.addText(t.icon, { x:5.5, y:ty, w:0.5, h:0.56, fontSize:20, align:"center", valign:"middle" });
    s.addText(t.title, { x:6.02, y:ty+0.02, w:3.5, h:0.28, fontSize:13, fontFace:"Trebuchet MS", bold:true, color:C.blue });
    s.addText(t.desc,  { x:6.02, y:ty+0.30, w:3.5, h:0.26, fontSize:12, fontFace:"Calibri", color:C.muted });
  });
}

// ── SLIDE 7 — Challenges / Learnings / Future (horizontal band layout) ────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  addHeader(s, "Challenges, Learnings & Future Work");

  const bands = [
    {
      icon:"⚡", title:"Challenges", color:C.high, bg:"FEF0EE",
      items:["Class Imbalance\n7 High / 2,000 records", "Port 5000 → 5001\nmacOS AirPlay conflict", "brew install libomp\nXGBoost on Mac"],
    },
    {
      icon:"💡", title:"Learnings", color:C.teal, bg:"E6F7F5",
      items:["End-to-End MLOps\ndata → model → API → cloud", "Macro F1 > Accuracy\nimbalanced classes", "Claude AI\ncode, debug & deploy"],
    },
    {
      icon:"🚀", title:"Future Work", color:C.blue, bg:"EAF4FB",
      items:["Temporal Features\nafterShock sequences", "USGS WebSocket\nsub-second map updates", "Magnitude Regression\nearly warning potential"],
    },
  ];

  const BAND_H = 1.28;
  const BAND_GAP = 0.1;

  bands.forEach((band, i) => {
    const by = 1.0 + i * (BAND_H + BAND_GAP);

    // Band background
    s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:by, w:9.4, h:BAND_H, fill:{color:band.bg}, line:{color:band.bg} });
    // Left accent bar
    s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:by, w:0.1, h:BAND_H, fill:{color:band.color}, line:{color:band.color} });

    // Icon in circle
    s.addShape(pres.shapes.OVAL, { x:0.55, y:by+0.22, w:0.76, h:0.76, fill:{color:band.color}, line:{color:band.color} });
    s.addText(band.icon, { x:0.55, y:by+0.22, w:0.76, h:0.76, fontSize:22, align:"center", valign:"middle" });

    // Section title
    s.addText(band.title, { x:1.44, y:by+0.28, w:1.9, h:0.65, fontSize:19, fontFace:"Trebuchet MS", bold:true, color:band.color, valign:"middle" });

    // Vertical separator
    s.addShape(pres.shapes.RECTANGLE, { x:3.42, y:by+0.14, w:0.04, h:BAND_H-0.28, fill:{color:band.color}, line:{color:band.color} });

    // 3 items as white pill chips
    band.items.forEach((item, j) => {
      const ix = 3.60 + j * 2.06;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:ix, y:by+0.2, w:2.0, h:0.86, fill:{color:"FFFFFF"}, line:{color:band.color}, shadow:makeShadow(), rectRadius:0.08 });
      s.addText(item, { x:ix+0.08, y:by+0.2, w:1.84, h:0.86, fontSize:12, fontFace:"Calibri", color:C.text, align:"center", valign:"middle" });
    });
  });

  s.addText("EarthSafe  ·  STAT 418  ·  Yutong Ma  ·  UCLA Spring 2026", {
    x:0.4, y:5.38, w:9.2, h:0.2, fontSize:11, fontFace:"Calibri", color:C.muted, align:"center",
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "EarthSafe_Final_Presentation.pptx" })
  .then(() => console.log("Saved: EarthSafe_Final_Presentation.pptx"))
  .catch(err => { console.error(err); process.exit(1); });
