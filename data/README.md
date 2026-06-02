# data/

| Directory | Description |
|-----------|-------------|
| `raw/` | Raw CSV downloaded from USGS API (2023–2024, M≥2.5, 2,000 records) — excluded from git via `.gitignore` |
| `processed/` | EDA figures and solution architecture diagram used in README and presentation |

To re-collect raw data:
```bash
python src/data/collect.py
```
