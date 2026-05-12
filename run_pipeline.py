"""
run_pipeline.py
───────────────
Master script — runs the complete ML pipeline end to end.

Usage:
    python run_pipeline.py              # full pipeline (50 Optuna trials)
    python run_pipeline.py --fast       # quick test (10 trials)
    python run_pipeline.py --skip-tune  # use existing model, just evaluate+explain
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

def banner(msg):
    print("\n" + "="*60)
    print(f"  {msg}")
    print("="*60)


def main():
    parser = argparse.ArgumentParser(description="AlzPredict AI — full ML pipeline")
    parser.add_argument("--fast",       action="store_true", help="10 Optuna trials")
    parser.add_argument("--skip-tune",  action="store_true", help="Skip training, evaluate existing model")
    args = parser.parse_args()

    n_trials = 10 if args.fast else 50

    if not args.skip_tune:
        banner("STEP 1/4 — Preprocessing & Feature Selection")
        from src.preprocess import run as preprocess_run
        preprocess_run()

        banner("STEP 2/4 — Model Training + Hyperparameter Tuning")
        from src.train_model import run as train_run
        train_run(n_trials=n_trials)
    else:
        print("[pipeline] --skip-tune: skipping preprocessing and training")

    banner("STEP 3/4 — Evaluation & Model Comparison")
    from src.evaluate_model import run as evaluate_run
    evaluate_run()

    banner("STEP 4/4 — SHAP Explainability")
    from src.explain_model import run as explain_run
    explain_run()

    banner("STEP 5/6 — Conformal Prediction (Uncertainty Quantification)")
    try:
        from src.conformal_prediction import run as conformal_run
        conformal_run()
    except Exception as e:
        print(f"[pipeline] Conformal skipped: {e}")
        print("[pipeline] Install with: pip install mapie")

    banner("STEP 6/6 — Fairness & Bias Audit")
    from src.fairness_analysis import run as fairness_run
    fairness_run()

    banner("✅ PIPELINE COMPLETE")
    print("  Figures  → reports/figures/")
    print("  Model    → models/xgboost_model.pkl")
    print("  MLflow   → run 'mlflow ui' to view experiment tracker")
    print("\n  Launch dashboard:")
    print("  streamlit run app/streamlit_app.py")
    print("="*60)


if __name__ == "__main__":
    main()
