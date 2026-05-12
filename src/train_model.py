"""
train_model.py
──────────────
Trains the XGBoost classifier with Optuna Bayesian tuning + SMOTE.
Saves the trained model and label encoder to models/.

Run:  python src/train_model.py
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
import xgboost as xgb
import optuna
import warnings
warnings.filterwarnings("ignore")
optuna.logging.set_verbosity(optuna.logging.WARNING)

# MLflow — optional, gracefully skipped if not installed
try:
    import mlflow
    import mlflow.xgboost
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    print("[train] mlflow not installed — experiment tracking disabled. "
          "Install with: pip install mlflow")

# ── Paths ───────────────────────────────────────────────────────
PROCESSED_PATH = os.path.join("data", "processed", "oasis_clean.csv")
FEATURES_PATH  = os.path.join("data", "processed", "top_features.txt")
MODEL_DIR      = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH    = os.path.join(MODEL_DIR, "xgboost_model.pkl")
ENCODER_PATH  = os.path.join(MODEL_DIR, "label_encoder.pkl")
PARAMS_PATH   = os.path.join(MODEL_DIR, "best_params.pkl")
SPLIT_PATH    = os.path.join(MODEL_DIR, "train_test_split.pkl")


def load_data():
    df = pd.read_csv(PROCESSED_PATH)
    with open(FEATURES_PATH) as f:
        top_features = [l.strip() for l in f.readlines()]
    X = df[top_features]
    y = df["Group"]
    return X, y, top_features


def smote_balance(X, y):
    sm = SMOTE(random_state=42)
    X_res, y_res = sm.fit_resample(X, y)
    print(f"[train] After SMOTE: {dict(pd.Series(y_res).value_counts())}")
    return X_res, y_res


def optuna_tune(X_res, y_enc, n_trials: int = 50):
    if MLFLOW_AVAILABLE:
        mlflow.set_experiment("alzpredict-xgboost-tuning")

    def objective(trial):
        params = {
            "n_estimators":     trial.suggest_int("n_estimators", 100, 500),
            "max_depth":        trial.suggest_int("max_depth", 3, 10),
            "learning_rate":    trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
            "subsample":        trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "gamma":            trial.suggest_float("gamma", 0, 5),
            "reg_alpha":        trial.suggest_float("reg_alpha", 0, 2),
            "reg_lambda":       trial.suggest_float("reg_lambda", 0.5, 5),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
            "use_label_encoder": False,
            "eval_metric": "mlogloss",
            "objective": "multi:softmax",
            "num_class": 3,
            "random_state": 42,
            "verbosity": 0,
        }
        model = xgb.XGBClassifier(**params)
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        score = cross_val_score(model, X_res, y_enc, cv=cv,
                                scoring="f1_macro", n_jobs=-1).mean()

        # Log every trial to MLflow
        if MLFLOW_AVAILABLE:
            with mlflow.start_run(run_name=f"trial_{trial.number}", nested=True):
                mlflow.log_params(params)
                mlflow.log_metric("cv_f1_macro", score)

        return score

    if MLFLOW_AVAILABLE:
        with mlflow.start_run(run_name="optuna_study"):
            study = optuna.create_study(direction="maximize")
            study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
            mlflow.log_param("n_trials", n_trials)
            mlflow.log_metric("best_f1_macro", study.best_value)
            mlflow.log_params({f"best_{k}": v
                               for k, v in study.best_params.items()})
    else:
        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=n_trials, show_progress_bar=True)

    best = study.best_params.copy()
    best.update({
        "use_label_encoder": False,
        "eval_metric": "mlogloss",
        "objective": "multi:softmax",
        "num_class": 3,
        "random_state": 42,
        "verbosity": 0,
    })
    print(f"[train] Best F1-Macro (CV): {study.best_value:.4f}")
    print(f"[train] Best params: {best}")
    return best


def run(n_trials: int = 50):
    print("[train] Loading data …")
    X, y, top_features = load_data()

    print("[train] Applying SMOTE …")
    X_res, y_res = smote_balance(X, y)

    le    = LabelEncoder()
    y_enc = le.fit_transform(y_res)

    print(f"[train] Running Optuna ({n_trials} trials) …")
    best_params = optuna_tune(X_res, y_enc, n_trials=n_trials)

    # Final train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_res, y_enc, test_size=0.2, random_state=42, stratify=y_enc)

    print("[train] Training final model …")
    model = xgb.XGBClassifier(**best_params)
    model.fit(X_train, y_train,
              eval_set=[(X_test, y_test)], verbose=False)

    # Cross-validation on full balanced set
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_res, y_enc, cv=cv, scoring="f1_macro")
    print(f"[train] CV F1-Macro: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Log final model to MLflow
    if MLFLOW_AVAILABLE:
        with mlflow.start_run(run_name="final_model"):
            mlflow.log_params(best_params)
            mlflow.log_metric("cv_f1_macro_mean", cv_scores.mean())
            mlflow.log_metric("cv_f1_macro_std",  cv_scores.std())
            mlflow.xgboost.log_model(model, artifact_path="xgboost_model")
            print("[train] MLflow: final model logged. Run 'mlflow ui' to inspect.")

    # Save artefacts
    joblib.dump(model,       MODEL_PATH)
    joblib.dump(le,          ENCODER_PATH)
    joblib.dump(best_params, PARAMS_PATH)
    joblib.dump({
        "X_train": X_train, "X_test": X_test,
        "y_train": y_train, "y_test": y_test,
        "X_res": X_res,     "y_enc": y_enc,
        "top_features": top_features,
        "cv_scores": cv_scores,
    }, SPLIT_PATH)

    print(f"[train] Model saved → {MODEL_PATH}")
    return model, best_params


if __name__ == "__main__":
    run()
