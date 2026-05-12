"""
src/conformal_prediction.py
────────────────────────────
Wraps the trained XGBoost model with MAPIE conformal prediction.
Produces coverage-guaranteed prediction sets instead of point predictions.

Run standalone:  python src/conformal_prediction.py

Key idea: instead of "78% Alzheimer's risk", the model says
          "I'm 90% confident this patient belongs to {Demented, Converted}"
          — with a mathematical guarantee on that 90%.
"""

import os
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import warnings
warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────
MODEL_PATH   = os.path.join("models", "xgboost_model.pkl")
SPLIT_PATH   = os.path.join("models", "train_test_split.pkl")
CONF_PATH    = os.path.join("models", "conformal_model.pkl")
REPORTS_DIR  = os.path.join("reports", "figures")
os.makedirs(REPORTS_DIR, exist_ok=True)

CLASS_NAMES  = ["Normal", "Demented", "Converted"]


def check_mapie():
    try:
        import mapie
        return True
    except ImportError:
        print("[conformal] mapie not installed. Run:  pip install mapie")
        return False


def build_conformal(alpha: float = 0.10):
    """
    Fit a conformal classifier with (1-alpha) coverage guarantee.
    alpha=0.10 → 90% coverage guarantee.
    """
    if not check_mapie():
        return None, None

    from mapie.classification import MapieClassifier
    from mapie.metrics import classification_coverage_score

    model = joblib.load(MODEL_PATH)
    split = joblib.load(SPLIT_PATH)

    X_res        = split["X_res"]
    y_enc        = split["y_enc"]
    top_features = split["top_features"]

    # Split balanced data: 60% train, 20% calibration, 20% test
    X_tr, X_tmp, y_tr, y_tmp = train_test_split(
        X_res, y_enc, test_size=0.40, random_state=42, stratify=y_enc)
    X_cal, X_test, y_cal, y_test = train_test_split(
        X_tmp, y_tmp, test_size=0.50, random_state=42, stratify=y_tmp)

    print(f"[conformal] Calibration set: {X_cal.shape[0]} samples")
    print(f"[conformal] Test set:        {X_test.shape[0]} samples")

    # Fit conformal wrapper (cv="prefit" = use existing model weights)
    mapie = MapieClassifier(estimator=model, method="lac", cv="prefit")
    mapie.fit(X_cal, y_cal)

    # Predict with coverage guarantee
    y_pred, y_sets = mapie.predict(X_test, alpha=alpha)

    # Measure actual coverage
    coverage = classification_coverage_score(y_test, y_sets)
    avg_set_size = y_sets.sum(axis=1).mean()

    print(f"\n[conformal] Results (α={alpha}, target coverage={(1-alpha)*100:.0f}%):")
    print(f"  Actual coverage:      {coverage:.3f}  (target ≥ {1-alpha:.2f})")
    print(f"  Avg prediction set size: {avg_set_size:.2f} classes")
    print(f"\n  Interpretation:")
    print(f"  → Model guarantees the true class is in the prediction set")
    print(f"    {coverage*100:.1f}% of the time — proven by conformal theory.")

    print(f"\n[conformal] Sample predictions (first 8 test patients):")
    print(f"  {'Patient':>8} | {'True':>10} | {'Point Pred':>12} | {'Prediction Set (90% cover)':>30} | {'Uncertain?':>10}")
    print("  " + "-"*80)
    for i in range(min(8, len(y_test))):
        true_name  = CLASS_NAMES[y_test[i]]
        pred_name  = CLASS_NAMES[y_pred[i]]
        pset_names = [CLASS_NAMES[j] for j in range(3) if y_sets[i, j]]
        uncertain  = "⚠️ YES" if len(pset_names) > 1 else "✅ NO"
        print(f"  {i:>8} | {true_name:>10} | {pred_name:>12} | {str(pset_names):>30} | {uncertain:>10}")

    # Save conformal model
    joblib.dump({
        "mapie":      mapie,
        "alpha":      alpha,
        "coverage":   coverage,
        "set_size":   avg_set_size,
        "X_test":     X_test,
        "y_test":     y_test,
        "y_pred":     y_pred,
        "y_sets":     y_sets,
        "top_features": top_features,
    }, CONF_PATH)
    print(f"\n[conformal] Saved → {CONF_PATH}")

    return mapie, {"coverage": coverage, "set_size": avg_set_size, "alpha": alpha}


def plot_conformal_results():
    """Visualise coverage and prediction set sizes."""
    if not os.path.exists(CONF_PATH):
        print("[conformal] Run build_conformal() first.")
        return

    data     = joblib.load(CONF_PATH)
    y_test   = data["y_test"]
    y_pred   = data["y_pred"]
    y_sets   = data["y_sets"]
    coverage = data["coverage"]
    alpha    = data["alpha"]

    set_sizes = y_sets.sum(axis=1)

    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle(
        f"Conformal Prediction Results  |  Target coverage: {(1-alpha)*100:.0f}%  |  "
        f"Actual coverage: {coverage*100:.1f}%",
        fontsize=13, fontweight="bold"
    )

    # ── Plot 1: prediction set size distribution ─────────────────
    ax = axes[0]
    size_counts = pd.Series(set_sizes).value_counts().sort_index()
    ax.bar(size_counts.index, size_counts.values,
           color=["#27AE60", "#E67E22", "#C0392B"], edgecolor="white")
    ax.set_xlabel("Prediction Set Size (# classes included)")
    ax.set_ylabel("Count")
    ax.set_title("Prediction Set Sizes\n(smaller = more certain)")
    ax.set_xticks([1, 2, 3])
    ax.set_xticklabels(["1\n(Certain)", "2\n(Ambiguous)", "3\n(Uncertain)"])
    for bar, count in zip(ax.patches, size_counts.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                str(count), ha="center", va="bottom", fontweight="bold")

    # ── Plot 2: per-class uncertainty ────────────────────────────
    ax = axes[1]
    certain_per_class   = [((y_test == c) & (set_sizes == 1)).sum() for c in range(3)]
    uncertain_per_class = [((y_test == c) & (set_sizes > 1)).sum() for c in range(3)]
    x = np.arange(3)
    w = 0.35
    ax.bar(x - w/2, certain_per_class,   w, label="Certain (set=1)",   color="#27AE60")
    ax.bar(x + w/2, uncertain_per_class, w, label="Uncertain (set>1)", color="#E74C3C")
    ax.set_xticks(x)
    ax.set_xticklabels(CLASS_NAMES)
    ax.set_ylabel("Count")
    ax.set_title("Certainty by True Class\n(Converted class naturally more uncertain)")
    ax.legend()

    # ── Plot 3: coverage gauge ───────────────────────────────────
    ax = axes[2]
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect("equal")
    target  = 1 - alpha
    actual  = coverage
    color   = "#27AE60" if actual >= target else "#E74C3C"

    theta1  = np.linspace(0, np.pi, 100)
    ax.fill_between(np.cos(theta1), np.sin(theta1), 0.5,
                    alpha=0.15, color="gray")
    theta2  = np.linspace(0, np.pi * actual, 100)
    ax.fill_between(np.cos(theta2), np.sin(theta2), 0.5,
                    alpha=0.6, color=color)
    ax.text(0.5, 0.35, f"{actual*100:.1f}%",
            ha="center", va="center", fontsize=28, fontweight="bold", color=color)
    ax.text(0.5, 0.18, f"Coverage (target {target*100:.0f}%)",
            ha="center", va="center", fontsize=10, color="gray")
    ax.axis("off")
    ax.set_title(f"Coverage Guarantee\n({'✅ MET' if actual>=target else '❌ MISSED'})",
                 fontsize=12, fontweight="bold",
                 color="#27AE60" if actual >= target else "#E74C3C")

    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, "conformal_prediction.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[conformal] Plot saved → {path}")
    return path


def predict_with_uncertainty(model_or_mapie, patient_df, top_features, alpha=0.10):
    """
    For the Streamlit app.
    Returns point prediction, probabilities, and prediction set.
    """
    if not check_mapie():
        return None, None, None

    if hasattr(model_or_mapie, "predict_proba"):
        # raw XGBoost — need to load conformal wrapper
        if os.path.exists(CONF_PATH):
            data  = joblib.load(CONF_PATH)
            mapie = data["mapie"]
        else:
            return None, None, None
    else:
        mapie = model_or_mapie

    X = patient_df[top_features]
    y_pred, y_sets = mapie.predict(X, alpha=alpha)
    pset = [CLASS_NAMES[j] for j in range(3) if y_sets[0, j]]
    return int(y_pred[0]), y_sets[0], pset


def run():
    print("[conformal] Building conformal prediction wrapper …")
    mapie, stats = build_conformal(alpha=0.10)
    if mapie is not None:
        plot_conformal_results()
        print(f"\n[conformal] ✅ Done — coverage {stats['coverage']*100:.1f}% "
              f"with avg set size {stats['set_size']:.2f}")


if __name__ == "__main__":
    run()
