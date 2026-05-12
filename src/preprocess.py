"""
preprocess.py
─────────────
Loads, cleans, and prepares the OASIS Longitudinal dataset.
Run standalone:  python src/preprocess.py
"""

import os
import pandas as pd
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
from sklearn.ensemble import RandomForestClassifier
import joblib
import warnings
warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────
RAW_PATH       = os.path.join("data", "raw", "oasis_longitudinal.csv")
PROCESSED_PATH = os.path.join("data", "processed", "oasis_clean.csv")
FEATURES_PATH  = os.path.join("data", "processed", "top_features.txt")

os.makedirs(os.path.join("data", "processed"), exist_ok=True)


def load_and_clean(path: str = RAW_PATH) -> pd.DataFrame:
    """Load raw OASIS CSV and return a cleaned DataFrame."""
    df = pd.read_csv(path)
    print(f"[preprocess] Loaded {df.shape[0]} rows, {df.shape[1]} cols")

    # 1. Drop irrelevant columns
    drop_cols = ["Subject ID", "MRI ID", "Hand", "Delay"]
    df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True)

    # 2. Encode categorical columns
    df["M/F"]   = df["M/F"].map({"M": 1, "F": 0})
    df["Group"] = df["Group"].map({"Nondemented": 0, "Demented": 1, "Converted": 2})

    # 3. Median imputation for numeric columns
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col].fillna(df[col].median(), inplace=True)

    # 4. Remove fully null rows, deduplicate
    df.dropna(inplace=True)
    df = df.drop_duplicates(keep="first").reset_index(drop=True)

    print(f"[preprocess] Cleaned shape: {df.shape}")
    print(f"[preprocess] Class distribution:\n{df['Group'].value_counts().to_string()}")
    return df


def select_features(df: pd.DataFrame, n_top: int = 5) -> list[str]:
    """Return union of top-n features from ANOVA, Mutual Info, and RF."""
    X = df.drop(columns=["Group"])
    y = df["Group"]

    # ANOVA F-score
    sel = SelectKBest(f_classif, k="all").fit(X, y)
    f_top = pd.Series(sel.scores_, index=X.columns).nlargest(n_top).index.tolist()

    # Mutual Information
    mi = pd.Series(mutual_info_classif(X, y, random_state=42), index=X.columns)
    mi_top = mi.nlargest(n_top).index.tolist()

    # Random Forest importance
    rf = RandomForestClassifier(n_estimators=100, random_state=42).fit(X, y)
    rf_top = pd.Series(rf.feature_importances_, index=X.columns).nlargest(n_top).index.tolist()

    top_features = list(set(f_top + mi_top + rf_top))
    print(f"[preprocess] Selected features ({len(top_features)}): {top_features}")
    return top_features


def run():
    df = load_and_clean()
    df.to_csv(PROCESSED_PATH, index=False)
    print(f"[preprocess] Saved → {PROCESSED_PATH}")

    top_features = select_features(df)
    with open(FEATURES_PATH, "w") as f:
        f.write("\n".join(top_features))
    print(f"[preprocess] Features saved → {FEATURES_PATH}")
    return df, top_features


if __name__ == "__main__":
    run()
