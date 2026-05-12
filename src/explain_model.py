"""
explain_model.py
────────────────
Generates all SHAP explainability plots and saves them to reports/figures/.
Also exposes helper functions used by the Streamlit app.

Run:  python src/explain_model.py
"""

import os
import joblib
import numpy as np
import matplotlib.pyplot as plt
import shap
import warnings
warnings.filterwarnings("ignore")

# ── Paths ───────────────────────────────────────────────────────
MODEL_PATH  = os.path.join("models", "xgboost_model.pkl")
SPLIT_PATH  = os.path.join("models", "train_test_split.pkl")
REPORTS_DIR = os.path.join("reports", "figures")
os.makedirs(REPORTS_DIR, exist_ok=True)


def load_artefacts():
    model = joblib.load(MODEL_PATH)
    split = joblib.load(SPLIT_PATH)
    return model, split


# ── Core SHAP helper ────────────────────────────────────────────
def get_shap_2d(sv, cls: int = 1):
    """Safely extract 2D SHAP array (n_samples, n_features) for a given class."""
    if isinstance(sv, list):
        arr = np.array(sv[cls])
    else:
        arr = np.array(sv)
    if arr.ndim == 3:          # (samples, features, classes)
        arr = arr[:, :, cls]
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)
    return arr


def compute_shap(model, X_test, top_features):
    """Return explainer, raw shap_values, and 2D aligned shap_top."""
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)
    shap_2d     = get_shap_2d(shap_values, cls=1)

    feature_cols = list(X_test.columns)
    top_idx      = [feature_cols.index(f) for f in top_features if f in feature_cols]
    shap_top     = shap_2d[:, top_idx]
    return explainer, shap_values, shap_top


# ── Individual plot functions ────────────────────────────────────
def plot_global_importance(shap_top, top_features):
    """Bar chart of mean |SHAP| per feature — global importance."""
    mean_abs = np.abs(shap_top).mean(axis=0)
    order    = np.argsort(mean_abs)[::-1]

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.barh([top_features[i] for i in order], mean_abs[order], color="#E91E63")
    ax.set_title("SHAP Global Feature Importance (Demented Class)")
    ax.set_xlabel("Mean |SHAP Value|")
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, "shap_global_importance.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"[explain] Saved → {path}")
    return path


def plot_beeswarm(shap_top, X_test, top_features):
    """SHAP beeswarm plot showing per-sample impact."""
    shap_exp = shap.Explanation(
        values        = shap_top,
        data          = np.array(X_test[top_features]),
        feature_names = top_features,
    )
    plt.figure(figsize=(9, 5))
    shap.plots.beeswarm(shap_exp, show=False)
    plt.title("SHAP Beeswarm — Feature Impact on Alzheimer's Prediction")
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, "shap_beeswarm.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[explain] Saved → {path}")
    return path


def plot_waterfall(shap_top, X_test, top_features, base_val,
                   patient_idx: int = 0):
    """Waterfall plot for a single patient — local explanation."""
    shap_exp = shap.Explanation(
        values        = shap_top,
        base_values   = base_val,
        data          = np.array(X_test[top_features]),
        feature_names = top_features,
    )
    plt.figure(figsize=(9, 5))
    shap.plots.waterfall(shap_exp[patient_idx], show=False)
    plt.title(f"SHAP Waterfall — Patient #{patient_idx} Local Explanation")
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, f"shap_waterfall_patient{patient_idx}.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[explain] Saved → {path}")
    return path


def plot_local_bar(shap_top, top_features, patient_idx: int = 0):
    """Simple bar chart of SHAP values for one patient."""
    sv = shap_top[patient_idx]
    colors = ["#F44336" if v > 0 else "#2196F3" for v in sv]
    fig, ax = plt.subplots(figsize=(9, 4))
    ax.bar(top_features, sv, color=colors)
    ax.axhline(0, color="black", lw=0.8, linestyle="--")
    ax.set_title(f"SHAP Local Bar — Patient #{patient_idx} (Demented Risk Contributions)")
    ax.set_ylabel("SHAP Value")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, f"shap_local_bar_patient{patient_idx}.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"[explain] Saved → {path}")
    return path


# ── For Streamlit: single-patient SHAP ──────────────────────────
def explain_single_patient(model, patient_df, top_features):
    """
    Given a single-row DataFrame of patient features,
    return SHAP values and feature names for the Demented class.
    Used by the Streamlit app for real-time explanation.
    """
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(patient_df[top_features])
    shap_2d     = get_shap_2d(shap_values, cls=1)
    sv          = shap_2d[0]                     # shape: (n_features,)
    return sv, top_features


def run():
    model, split = load_artefacts()
    X_test       = split["X_test"]
    top_features = split["top_features"]

    print("[explain] Computing SHAP values …")
    explainer, _, shap_top = compute_shap(model, X_test, top_features)

    expected_value = explainer.expected_value
    if isinstance(expected_value, (list, np.ndarray)) and len(expected_value) > 1:
        base_val = float(expected_value[1])
    else:
        base_val = float(expected_value)

    plot_global_importance(shap_top, top_features)
    plot_beeswarm(shap_top, X_test, top_features)
    plot_waterfall(shap_top, X_test, top_features, base_val=base_val, patient_idx=0)
    plot_local_bar(shap_top, top_features, patient_idx=0)

    print("\n[explain] All SHAP figures saved to reports/figures/")


if __name__ == "__main__":
    run()
