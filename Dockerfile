FROM python:3.11-slim

WORKDIR /app

# System deps for XGBoost (libomp) and slim image
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY models/ ./models/
COPY data/processed/ ./data/processed/

# Default: run Flask API
# Override with: docker run ... streamlit run src/app/streamlit_app.py
EXPOSE 5001 8501

ENV PYTHONUNBUFFERED=1

CMD ["python", "src/api/app.py"]
