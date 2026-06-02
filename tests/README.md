# tests/

Unit tests for the Flask API.

| File | Description |
|------|-------------|
| `test_api.py` | 9 tests covering `/health`, `/predict` (Low/Moderate/High), probability sum, missing fields (400), invalid value (400), no body (400), input echo |

Run tests:
```bash
pytest tests/test_api.py -v
```

CI runs automatically on every push via GitHub Actions (`.github/workflows/ci.yml`).
