# src/

Source code for EarthSafe.

| Directory | Description |
|-----------|-------------|
| `data/` | Data collection (`collect.py`) and preprocessing (`preprocess.py`) |
| `models/` | Model training and evaluation (`train.py`) |
| `api/` | Flask REST API (`app.py`) — endpoints: `POST /predict`, `GET /recent`, `GET /health` |
| `app/` | Streamlit web application (`streamlit_app.py`) — two-page interactive UI |
