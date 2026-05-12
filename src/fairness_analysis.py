"""
src/fairness_analysis.py
────────────────────────
Audits the trained XGBoost model for demographic bias.
Checks whether performance is consistent across:
  - Gender (Male vs Female)
  - Age groups (< 75 vs ≥ 75)
  - Education levels (low / medium / high)
  - Socioeconomic status (high / low)

Run standalone:  python src/fairness_analysis.py

Why this matters: EU AI Act Article 10 and FDA AI/ML guidance both require
bias audits for medical decision-support tools. Almost zero student projects
include this — doing so signals responsible AI engineering.
"""

import os
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import (
    f1_score, accuracy_score, recall_score, precision_score,
    classification_report
)
import warnings
warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────
MODEL_PATH   = os.path.join("models", "xgboost_model.pkl")
SPLIT_PATH   = os.path.join("models", "train_test_split.pkl")
REPORTS_DIR  = os.path.join("reports", "figures")
os.makedirs(REPORTS_DIR, exist_ok=True)

CLASS_NAMES  = ["Normal", "Demented", "Converted"]


def compute_group_metrics(y_true, y_pred, group_name: str) -> dict:
    """Return fairness metrics for a subgroup."""
    if len(y_true) == 0:
        return {}
    return {
        "Group":     group_name,
        "N":         len(y_true),
        "Accuracy":  round(accuracy_score(y_true, y_pred), 3),
        "F1-Macro":  round(f1_score(y_true, y_pred, average="macro",  zero_division=0), 3),
        "Recall-Mac":round(recall_score(y_true, y_pred, average="macro", zero_division=0), 3),
        "Prec-Mac":  round(precision_score(y_true, y_pred, average="macro", zero_division=0), 3),
    }


def run_fairness_audit():
    model = joblib.load(MODEL_PATH)
    split = joblib.load(SPLIT_PATH)

    X_test       = split["X_test"]
    y_test       = split["y_test"]
    top_features = split["top_features"]

    y_pred = model.predict(X_test)

    # Reset index for boolean masking
    X_df = pd.DataFrame(X_test, columns=top_features).reset_index(drop=True)
    y_t  = pd.Series(y_test).reset_index(drop=True)
    y_p  = pd.Series(y_pred).reset_index(drop=True)

    results = []

    # ── 1. Overall baseline ───────────────────────────────────────
    results.append(compute_group_metrics(y_t, y_p, "Overall (baseline)"))

    # ── 2. Gender ─────────────────────────────────────────────────
    if "M/F" in X_df.columns:
        for val, label in [(1, "Male"), (0, "Female")]:
            mask = X_df["M/F"] == val
            results.append(compute_group_metrics(y_t[mask], y_p[mask], f"Gender: {label}"))

    # ── 3. Age groups ─────────────────────────────────────────────
    if "Age" in X_df.columns:
        for lo, hi, label in [(0, 70, "Age < 70"), (70, 80, "Age 70–79"), (80, 200, "Age ≥ 80")]:
            mask = (X_df["Age"] >= lo) & (X_df["Age"] < hi)
            if mask.sum() >= 3:
                results.append(compute_group_metrics(y_t[mask], y_p[mask], label))

    # ── 4. Education ──────────────────────────────────────────────
    if "EDUC" in X_df.columns:
        edu_median = X_df["EDUC"].median()
        for mask, label in [
            (X_df["EDUC"] <= edu_median, f"Educ ≤ {edu_median:.0f} yrs (lower)"),
            (X_df["EDUC"] >  edu_median, f"Educ > {edu_median:.0f} yrs (higher)"),
        ]:
            if mask.sum() >= 3:
                results.append(compute_group_metrics(y_t[mask], y_p[mask], label))

    # ── 5. SES ────────────────────────────────────────────────────
    if "SES" in X_df.columns:
        for mask, label in [
            (X_df["SES"] <= 2, "SES 1–2 (higher status)"),
            (X_df["SES"] >= 4, "SES 4–5 (lower status)"),
        ]:
            if mask.sum() >= 3:
                results.append(compute_group_metrics(y_t[mask], y_p[mask], label))

    df_results = pd.DataFrame([r for r in results if r])
    df_results = df_results.set_index("Group")

    print("\n" + "="*70)
    print("  FAIRNESS & BIAS AUDIT — AlzPredict AI")
    print("="*70)
    print(df_results.to_string())

    # ── Disparity analysis ────────────────────────────────────────
    print("\n  Disparity Analysis:")
    baseline_f1  = df_results.loc["Overall (baseline)", "F1-Macro"]
    baseline_acc = df_results.loc["Overall (baseline)", "Accuracy"]

    for group in df_results.index[1:]:
        row   = df_results.loc[group]
        delta = row["F1-Macro"] - baseline_f1
        flag  = "⚠️  BIAS FLAG" if abs(delta) > 0.10 else "✅  OK"
        print(f"  {group:45s}  ΔF1={delta:+.3f}  {flag}")

    print("\n  Interpretation:")
    print("  ΔF1 > ±0.10 = meaningful performance gap between subgroups.")
    print("  This audit is required by EU AI Act Art.10 for high-risk medical AI.")
    print("="*70)

    return df_results


def plot_fairness(df_results: pd.DataFrame):
    """Bar chart comparing F1-Macro across all demographic subgroups."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle("Fairness Audit — Model Performance Across Demographic Subgroups",
                 fontsize=13, fontweight="bold")

    baseline_f1  = df_results.loc["Overall (baseline)", "F1-Macro"]
    baseline_acc = df_results.loc["Overall (baseline)", "Accuracy"]
    sub = df_results.drop("Overall (baseline)")

    # ── F1-Macro ─────────────────────────────────────────────────
    ax = axes[0]
    colors = ["#27AE60" if abs(v - baseline_f1) <= 0.10 else "#E74C3C"
              for v in sub["F1-Macro"]]
    bars = ax.barh(sub.index, sub["F1-Macro"], color=colors, edgecolor="white")
    ax.axvline(baseline_f1, color="navy", lw=2, linestyle="--",
               label=f"Overall baseline ({baseline_f1:.3f})")
    ax.axvline(baseline_f1 - 0.10, color="orange", lw=1.5, linestyle=":",
               label="±0.10 bias threshold")
    ax.axvline(baseline_f1 + 0.10, color="orange", lw=1.5, linestyle=":")
    ax.set_xlabel("F1-Macro")
    ax.set_title("F1-Macro by Subgroup\n(green = within ±0.10, red = bias flag)")
    ax.legend(fontsize=8)
    ax.set_xlim(0, 1.05)
    for bar, val in zip(bars, sub["F1-Macro"]):
        ax.text(val + 0.01, bar.get_y() + bar.get_height()/2,
                f"{val:.3f}", va="center", fontsize=9)

    # ── Sample size ───────────────────────────────────────────────
    ax = axes[1]
    ax.barh(sub.index, sub["N"], color="#2980B9", edgecolor="white")
    ax.set_xlabel("Number of Patients in Subgroup")
    ax.set_title("Subgroup Sample Sizes\n(small N = less reliable estimates)")
    for bar, val in zip(ax.patches, sub["N"]):
        ax.text(val + 0.3, bar.get_y() + bar.get_height()/2,
                str(int(val)), va="center", fontsize=9)

    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, "fairness_audit.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[fairness] Plot saved → {path}")
    return path


def run():
    print("[fairness] Running demographic bias audit …")
    df_results = run_fairness_audit()
    plot_fairness(df_results)
    print("\n[fairness] ✅ Done")
    return df_results


if __name__ == "__main__":
    run()
