"""
Clean and encode raw earthquake data for model training.
"""

import pandas as pd
from pathlib import Path
from sklearn.preprocessing import LabelEncoder

RAW_PATH = Path(__file__).parents[2] / "data" / "raw" / "earthquakes.csv"
PROCESSED_PATH = Path(__file__).parents[2] / "data" / "processed" / "earthquakes_clean.csv"

FEATURES = ["magnitude", "depth", "gap", "rms", "location_type"]
TARGET = "hazard_label"
LABEL_ORDER = ["Low", "Moderate", "High"]


def load_and_clean(path: Path = RAW_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df[FEATURES + [TARGET]].dropna()
    df["location_type"] = df["location_type"].map({"inland": 0, "offshore": 1})
    df[TARGET] = pd.Categorical(df[TARGET], categories=LABEL_ORDER, ordered=True)
    return df


def save_processed(df: pd.DataFrame, path: Path = PROCESSED_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    print(f"Saved {len(df):,} clean records to {path}")


if __name__ == "__main__":
    df = load_and_clean()
    print(df[TARGET].value_counts())
    save_processed(df)
