"""
USGS Earthquake Hazards Program API data collector.
Fetches M>=2.5 earthquakes and labels hazard level for model training.
"""

import time
import requests
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta

USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
OUTPUT_PATH = Path(__file__).parents[2] / "data" / "raw" / "earthquakes.csv"

HAZARD_THRESHOLDS = {"low_max": 4.0, "high_min": 6.0}


def label_hazard(magnitude: float) -> str:
    if magnitude < HAZARD_THRESHOLDS["low_max"]:
        return "Low"
    elif magnitude >= HAZARD_THRESHOLDS["high_min"]:
        return "High"
    return "Moderate"


def fetch_chunk(start_time: str, end_time: str, min_magnitude: float = 2.5) -> list[dict]:
    params = {
        "format": "geojson",
        "starttime": start_time,
        "endtime": end_time,
        "minmagnitude": min_magnitude,
        "orderby": "time",
        "limit": 20000,
    }
    resp = requests.get(USGS_URL, params=params, timeout=60)
    resp.raise_for_status()
    return resp.json()["features"]


def parse_feature(feature: dict) -> dict | None:
    props = feature["properties"]
    geo = feature["geometry"]
    mag = props.get("mag")
    depth = geo["coordinates"][2] if geo and geo.get("coordinates") else None
    if mag is None or depth is None:
        return None
    place: str = props.get("place") or ""
    location_type = "offshore" if "of " in place.lower() else "inland"
    return {
        "time": pd.to_datetime(props["time"], unit="ms"),
        "magnitude": float(mag),
        "depth": float(depth),
        "gap": props.get("gap"),
        "rms": props.get("rms"),
        "location_type": location_type,
        "place": place,
        "hazard_label": label_hazard(float(mag)),
    }


def collect(
    start_year: int = 2023,
    end_year: int = 2024,
    min_magnitude: float = 2.5,
    chunk_days: int = 30,
) -> pd.DataFrame:
    """Fetch earthquakes by month to stay within USGS 20k-per-request limit."""
    all_records: list[dict] = []
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    cursor = start
    while cursor < end:
        chunk_end = min(cursor + timedelta(days=chunk_days), end)
        print(f"Fetching {cursor.date()} → {chunk_end.date()} ...", end=" ", flush=True)
        features = fetch_chunk(
            cursor.strftime("%Y-%m-%d"),
            chunk_end.strftime("%Y-%m-%d"),
            min_magnitude,
        )
        parsed = [r for f in features if (r := parse_feature(f)) is not None]
        all_records.extend(parsed)
        print(f"{len(parsed)} records")
        cursor = chunk_end + timedelta(days=1)
        time.sleep(0.5)  # be polite to USGS API

    df = pd.DataFrame(all_records)
    df = df.dropna(subset=["gap", "rms"])
    df = df.reset_index(drop=True)
    return df


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    print("Starting USGS data collection...")
    df = collect(start_year=2023, end_year=2024)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"\nSaved {len(df):,} records to {OUTPUT_PATH}")
    print(df["hazard_label"].value_counts())


if __name__ == "__main__":
    main()
