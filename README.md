# EarthSafe 🌍

Real-time earthquake hazard prediction using USGS seismic data.

**Live App:** *(link after Week 10 deploy)*  
**API:** *(link after Week 10 deploy)*

## What it does

EarthSafe classifies earthquake hazard level — **Low / Moderate / High** — from seismic features (magnitude, depth, azimuthal gap, RMS, location type). Users can drag sliders to explore real-time predictions and view the latest 24h earthquakes on a world map.

## Architecture

```
USGS API → Data Collection → XGBoost Model → Flask API → Streamlit App → Cloud Run
```

## Project Structure

```
EarthSafe/
├── data/
│   ├── raw/           # USGS CSV (gitignored)
│   └── processed/     # Cleaned data + EDA figures
├── notebooks/
│   └── eda.ipynb      # Exploratory Data Analysis
├── src/
│   ├── data/
│   │   ├── collect.py     # USGS API collector
│   │   └── preprocess.py  # Feature engineering
│   ├── models/
│   │   └── train.py       # XGBoost + comparison models
│   ├── api/
│   │   └── app.py         # Flask prediction API
│   └── app/
│       └── streamlit_app.py  # Interactive frontend
├── tests/
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Setup

```bash
pip install -r requirements.txt

# Collect data (takes ~2 min)
python src/data/collect.py

# Run EDA
jupyter notebook notebooks/eda.ipynb

# Train model (Week 8)
python src/models/train.py

# Start Flask API (Week 8)
python src/api/app.py

# Launch Streamlit app (Week 9)
streamlit run src/app/streamlit_app.py
```

## Timeline

| Week | Deliverable |
|------|------------|
| 7    | Data collection + EDA |
| 8    | Model training + Flask API |
| 9    | Streamlit app + Docker |
| 10   | Cloud Run deploy + final slides |

## Data

Source: [USGS Earthquake Hazards Program API](https://earthquake.usgs.gov/fdsnws/event/1/)  
Period: 2023–2024 | Min magnitude: M2.5 | ~2,000 records

**Hazard Labels:**
- Low: M < 4.0
- Moderate: M 4.0–6.0  
- High: M ≥ 6.0

## Course

UCLA STAT 418 — Tools in Data Science, Spring 2026
