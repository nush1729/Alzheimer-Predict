"""
evaluate_model.py
─────────────────
Loads saved model + split data and prints full evaluation metrics.
Saves confusion matrix + ROC curve to reports/figures/.

Run:  python src/evaluate_model.py
"""

import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report, confusion_matrix, ConfusionMatrixDisplay,
    roc_auc_score, roc_curve, f1_score, accuracy_score,
    precision_recall_curve, average_precision_score,
)
from sklearn.preprocessing import label_binarize
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
import warnings
warnings.filterwarnings("ignore")

# ── Paths ───────────────────────────────────────────────────────
MODEL_PATH   = os.path.join("models", "xgboost_model.pkl")
SPLIT_PATH   = os.path.join("models", "train_test_split.pkl")
REPORTS_DIR  = os.path.join("reports", "figures")
os.makedirs(REPORTS_DIR, exist_ok=True)

CLASS_NAMES  = ["Normal", "Demented", "Converted"]
COLORS       = ["#2196F3", "#FF5722", "#4CAF50"]


def load_artefacts():
    model = joblib.load(MODEL_PATH)
    split = joblib.load(SPLIT_PATH)
    return model, split


def evaluate(model, split):
    X_test  = split["X_test"]
    y_test  = split["y_test"]
    X_train = split["X_train"]
    y_train = split["y_train"]
    cv_scores = split["cv_scores"]

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)

    print("\n" + "="*60)
    print("  CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    acc = accuracy_score(y_test, y_pred)
    f1  = f1_score(y_test, y_pred, average="macro")
    y_bin = label_binarize(y_test, classes=[0, 1, 2])
    auc = roc_auc_score(y_bin, y_prob, multi_class="ovr")

    print(f"  Accuracy  : {acc:.4f}")
    print(f"  F1-Macro  : {f1:.4f}")
    print(f"  AUC-OvR   : {auc:.4f}")
    print(f"  CV F1     : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print("="*60)

    return y_pred, y_prob, y_bin, X_test, X_train, y_train


def plot_confusion_matrix(y_test, y_pred):
    fig, ax = plt.subplots(figsize=(7, 5))
    cm = confusion_matrix(y_test, y_pred)
    ConfusionMatrixDisplay(cm, display_labels=CLASS_NAMES).plot(
        ax=ax, cmap="Blues", colorbar=False)
    ax.set_title("Confusion Matrix — XGBoost (Best Model)")
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, "confusion_matrix.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"[evaluate] Saved → {path}")


def plot_roc(y_bin, y_prob):
    fig, ax = plt.subplots(figsize=(8, 5))
    for i, (name, color) in enumerate(zip(CLASS_NAMES, COLORS)):
        fpr, tpr, _ = roc_curve(y_bin[:, i], y_prob[:, i])
        auc = roc_auc_score(y_bin[:, i], y_prob[:, i])
        ax.plot(fpr, tpr, color=color, lw=2, label=f"{name} (AUC={auc:.3f})")
    ax.plot([0,1],[0,1],"k--", alpha=0.4)
    ax.set_title("ROC Curves (One-vs-Rest)")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.legend()
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, "roc_curves.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"[evaluate] Saved → {path}")


def compare_models(X_train, y_train, X_test, y_test, xgb_model):
    """Quick benchmark against 4 baselines."""
    baselines = {
        "XGBoost (Tuned)":  xgb_model,
        "Random Forest":    RandomForestClassifier(n_estimators=100, random_state=42),
        "GradBoost":        GradientBoostingClassifier(n_estimators=100, random_state=42),
        "Logistic Reg":     LogisticRegression(max_iter=1000, random_state=42),
        "SVM":              SVC(probability=True, random_state=42),
    }
    rows = []
    for name, m in baselines.items():
        if name != "XGBoost (Tuned)":
            m.fit(X_train, y_train)
        preds = m.predict(X_test)
        probs = m.predict_proba(X_test)
        y_bin = label_binarize(y_test, classes=[0,1,2])
        rows.append({
            "Model":    name,
            "Accuracy": round(accuracy_score(y_test, preds), 4),
            "F1-Macro": round(f1_score(y_test, preds, average="macro"), 4),
            "AUC-OvR":  round(roc_auc_score(y_bin, probs, multi_class="ovr"), 4),
        })
    comp = pd.DataFrame(rows).set_index("Model")
    print("\n[evaluate] Model Comparison:\n")
    print(comp.to_string())

    # Save comparison plot
    fig, ax = plt.subplots(figsize=(10, 5))
    comp.plot(kind="bar", ax=ax, colormap="Set2", edgecolor="black")
    ax.set_title("Model Comparison — Accuracy / F1-Macro / AUC")
    ax.set_ylim(0, 1.15)
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, "model_comparison.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"[evaluate] Saved → {path}")
    return comp


def run():
    model, split = load_artefacts()
    y_pred, y_prob, y_bin, X_test, X_train, y_train = evaluate(model, split)
    plot_confusion_matrix(split["y_test"], y_pred)
    plot_roc(y_bin, y_prob)
    compare_models(X_train, split["y_train"], X_test, split["y_test"], model)
    print("\n[evaluate] All evaluation figures saved to reports/figures/")


if __name__ == "__main__":
    run()
