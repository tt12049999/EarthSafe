"""
Train and evaluate XGBoost, Random Forest, and Logistic Regression
for earthquake hazard classification (Low / Moderate / High).

Run:
    python src/models/train.py
Outputs:
    models/xgb_model.pkl
    models/label_encoder.pkl
    models/feature_names.txt
"""

import json
import joblib
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score,
)
from sklearn.utils.class_weight import compute_sample_weight
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

DATA_PATH = Path(__file__).parents[2] / "data" / "raw" / "earthquakes.csv"
MODEL_DIR = Path(__file__).parents[2] / "models"
FIGURES_DIR = Path(__file__).parents[2] / "data" / "processed"

FEATURES = ["magnitude", "depth", "gap", "rms", "location_type"]
TARGET = "hazard_label"
LABEL_ORDER = ["Low", "Moderate", "High"]
RANDOM_STATE = 42


# ── Feature Engineering ──────────────────────────────────────────────────────

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # Derive location_type from place string
    df["location_type"] = df["place"].str.contains(r"\bof\b", case=False, na=False).astype(int)
    # Impute gap nulls with median
    df["gap"] = df["gap"].fillna(df["gap"].median())
    return df[FEATURES + [TARGET]].dropna()


# ── Models ────────────────────────────────────────────────────────────────────

def build_models(n_classes: int) -> dict:
    return {
        "Logistic Regression": LogisticRegression(
            max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=200, class_weight="balanced",
            random_state=RANDOM_STATE, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="mlogloss",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }


# ── Evaluation ────────────────────────────────────────────────────────────────

def evaluate_model(name: str, model, X: np.ndarray, y: np.ndarray,
                   le: LabelEncoder, cv: StratifiedKFold) -> dict:
    sample_weight = compute_sample_weight("balanced", y)

    if name == "XGBoost":
        # Manual CV loop: cross_val_predict fit_params API changed across sklearn versions
        y_pred = np.zeros(len(y), dtype=int)
        for train_idx, val_idx in cv.split(X, y):
            m = model.__class__(**model.get_params())
            m.fit(X[train_idx], y[train_idx],
                  sample_weight=sample_weight[train_idx])
            y_pred[val_idx] = m.predict(X[val_idx])
    else:
        y_pred = cross_val_predict(model, X, y, cv=cv)

    acc = accuracy_score(y, y_pred)
    macro_f1 = f1_score(y, y_pred, average="macro")
    report = classification_report(
        y, y_pred, target_names=le.classes_, output_dict=True
    )

    print(f"\n{'='*50}")
    print(f"  {name}")
    print(f"{'='*50}")
    print(f"  Accuracy : {acc:.4f}")
    print(f"  Macro F1 : {macro_f1:.4f}")
    print(classification_report(y, y_pred, target_names=le.classes_))

    return {
        "name": name,
        "accuracy": acc,
        "macro_f1": macro_f1,
        "y_pred": y_pred,
        "report": report,
    }


def plot_confusion_matrix(results: list[dict], y_true: np.ndarray,
                          le: LabelEncoder) -> None:
    fig, axes = plt.subplots(1, 3, figsize=(16, 4))
    for ax, res in zip(axes, results):
        cm = confusion_matrix(y_true, res["y_pred"])
        cm_pct = cm.astype(float) / cm.sum(axis=1, keepdims=True) * 100
        sns.heatmap(cm_pct, annot=True, fmt=".1f", cmap="Blues",
                    xticklabels=le.classes_, yticklabels=le.classes_,
                    ax=ax, cbar=False)
        ax.set_title(f"{res['name']}\nAcc={res['accuracy']:.3f}  F1={res['macro_f1']:.3f}",
                     fontsize=11, fontweight="bold")
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
    plt.suptitle("Confusion Matrices (5-Fold CV, % of actual class)",
                 fontsize=13, fontweight="bold")
    plt.tight_layout()
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    plt.savefig(FIGURES_DIR / "fig_confusion_matrices.png", bbox_inches="tight", dpi=120)
    plt.show()
    print(f"Saved → {FIGURES_DIR}/fig_confusion_matrices.png")


def plot_model_comparison(results: list[dict]) -> None:
    names = [r["name"] for r in results]
    accs = [r["accuracy"] for r in results]
    f1s = [r["macro_f1"] for r in results]

    x = np.arange(len(names))
    width = 0.35
    fig, ax = plt.subplots(figsize=(9, 5))
    bars1 = ax.bar(x - width / 2, accs, width, label="Accuracy", color="#3498db", alpha=0.85)
    bars2 = ax.bar(x + width / 2, f1s, width, label="Macro F1", color="#e74c3c", alpha=0.85)

    for bar in bars1 + bars2:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.005,
                f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=9)

    ax.set_xticks(x)
    ax.set_xticklabels(names, fontsize=11)
    ax.set_ylim(0, 1.1)
    ax.set_ylabel("Score")
    ax.set_title("Model Comparison (5-Fold CV)", fontsize=13, fontweight="bold")
    ax.legend()
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "fig_model_comparison.png", bbox_inches="tight", dpi=120)
    plt.show()
    print(f"Saved → {FIGURES_DIR}/fig_model_comparison.png")


def plot_feature_importance(model: XGBClassifier) -> None:
    importance = model.feature_importances_
    feat_df = pd.DataFrame({"feature": FEATURES, "importance": importance})
    feat_df = feat_df.sort_values("importance", ascending=True)

    fig, ax = plt.subplots(figsize=(8, 4))
    ax.barh(feat_df["feature"], feat_df["importance"], color="#2ecc71", alpha=0.85)
    ax.set_title("XGBoost Feature Importance", fontsize=13, fontweight="bold")
    ax.set_xlabel("Importance Score")
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "fig_feature_importance.png", bbox_inches="tight", dpi=120)
    plt.show()
    print(f"Saved → {FIGURES_DIR}/fig_feature_importance.png")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # Load & prepare
    df = pd.read_csv(DATA_PATH)
    df = engineer_features(df)
    print(f"Dataset: {len(df):,} records after preprocessing")
    print(f"Class distribution:\n{df[TARGET].value_counts()}\n")

    le = LabelEncoder()
    le.fit(LABEL_ORDER)
    X = df[FEATURES].values
    y = le.transform(df[TARGET])

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    models = build_models(n_classes=len(LABEL_ORDER))

    # Evaluate all three models
    results = []
    for name, model in models.items():
        res = evaluate_model(name, model, X, y, le, cv)
        results.append(res)

    # Plots
    plot_confusion_matrix(results, y, le)
    plot_model_comparison(results)

    # Train final XGBoost on full dataset and save
    print("\nTraining final XGBoost on full dataset...")
    sample_weight = compute_sample_weight("balanced", y)
    xgb = models["XGBoost"]
    xgb.fit(X, y, sample_weight=sample_weight)

    plot_feature_importance(xgb)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(xgb, MODEL_DIR / "xgb_model.pkl")
    joblib.dump(le, MODEL_DIR / "label_encoder.pkl")
    (MODEL_DIR / "feature_names.txt").write_text("\n".join(FEATURES))

    # Save metrics summary
    summary = {r["name"]: {"accuracy": r["accuracy"], "macro_f1": r["macro_f1"]}
               for r in results}
    (MODEL_DIR / "metrics_summary.json").write_text(json.dumps(summary, indent=2))

    print(f"\nModel saved → {MODEL_DIR}/xgb_model.pkl")
    print("Week 8 training complete.")


if __name__ == "__main__":
    main()
