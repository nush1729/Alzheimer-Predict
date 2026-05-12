"""
app/streamlit_app.py
────────────────────
Interactive Alzheimer's Risk Prediction Dashboard.

Local run:   streamlit run app/streamlit_app.py
Deploy:      Push to GitHub → connect Streamlit Cloud / HuggingFace Spaces
"""

import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import shap
import streamlit as st
from src.explain_model import explain_single_patient, get_shap_2d

# Conformal prediction — optional
try:
    from src.conformal_prediction import predict_with_uncertainty
    CONFORMAL_AVAILABLE = os.path.exists(os.path.join("models", "conformal_model.pkl"))
except Exception:
    CONFORMAL_AVAILABLE = False

# ── Page config ─────────────────────────────────────────────────
st.set_page_config(
    page_title  = "AlzPredict AI",
    page_icon   = "🧠",
    layout      = "wide",
    initial_sidebar_state = "expanded",
)

# ── Custom CSS ───────────────────────────────────────────────────
st.markdown("""
<style>
    /* Main background */
    .main { background: #0f1117; }

    /* Sidebar */
    section[data-testid="stSidebar"] {
        background: linear-gradient(160deg, #0d1b2a 0%, #1b2a3b 100%);
    }

    /* Metric cards */
    div[data-testid="metric-container"] {
        background: #1e2a3a;
        border: 1px solid #2d4a6e;
        border-radius: 12px;
        padding: 16px;
    }
    div[data-testid="metric-container"] label { color: #7ab3d4 !important; }
    div[data-testid="metric-container"] div   { color: #ffffff !important; }

    /* Risk badge */
    .risk-high   { background:#c0392b; color:white; padding:12px 24px;
                   border-radius:8px; font-size:22px; font-weight:bold;
                   text-align:center; margin:8px 0; }
    .risk-medium { background:#e67e22; color:white; padding:12px 24px;
                   border-radius:8px; font-size:22px; font-weight:bold;
                   text-align:center; margin:8px 0; }
    .risk-low    { background:#27ae60; color:white; padding:12px 24px;
                   border-radius:8px; font-size:22px; font-weight:bold;
                   text-align:center; margin:8px 0; }

    /* Headings */
    h1, h2, h3 { color: #e8f4fd !important; }
    p, li       { color: #c5d8ea !important; }

    /* Divider */
    hr { border-color: #2d4a6e; }
</style>
""", unsafe_allow_html=True)


# ── Load model artefacts ─────────────────────────────────────────
@st.cache_resource
def load_model():
    model        = joblib.load(os.path.join("models", "xgboost_model.pkl"))
    split        = joblib.load(os.path.join("models", "train_test_split.pkl"))
    top_features = split["top_features"]
    return model, top_features


def stratify_risk(proba_demented: float, proba_converted: float) -> tuple[str, str, str]:
    """
    Convert model probabilities into a clinical risk tier with recommended action.
    Returns (tier_label, css_class, recommended_action)
    """
    combined = proba_demented * 0.6 + proba_converted * 0.4
    if combined < 0.25:
        return "🟢 LOW RISK", "risk-low",    "Routine annual cognitive screening. No immediate intervention required."
    elif combined < 0.50:
        return "🟡 MODERATE RISK", "risk-medium", "6-month follow-up visit. Repeat MMSE and CDR assessment. Monitor nWBV trend."
    elif combined < 0.75:
        return "🟠 HIGH RISK", "risk-high",   "Neurologist referral within 3 months. Repeat MRI. Consider CSF biomarker panel."
    else:
        return "🔴 CRITICAL RISK", "risk-high", "Immediate specialist review. CSF amyloid-β/tau testing. Discuss treatment options."

try:
    model, top_features = load_model()
    model_loaded = True
except Exception as e:
    model_loaded = False
    model_err    = str(e)


# ── Header ───────────────────────────────────────────────────────
st.markdown("""
<div style='text-align:center; padding: 20px 0 10px 0;'>
  <h1 style='font-size:2.8rem; color:#00d4ff !important;'>🧠 AlzPredict AI</h1>
  <p style='font-size:1.1rem; color:#7ab3d4 !important;'>
    Explainable XGBoost · Clinical Alzheimer's Risk Prediction · SHAP Interpretability
  </p>
</div>
""", unsafe_allow_html=True)

st.markdown("---")

# ── Model not loaded warning ─────────────────────────────────────
if not model_loaded:
    st.error(f"⚠️ Model not found. Run the pipeline first:\n\n"
             f"```bash\npython src/preprocess.py\npython src/train_model.py\n```\n\n"
             f"Error: {model_err}")
    st.stop()

# ── Sidebar — Patient Input ──────────────────────────────────────
st.sidebar.markdown("## 🩺 Patient Clinical Data")
st.sidebar.markdown("Adjust the sliders to match patient measurements.")
st.sidebar.markdown("---")

# Only show sliders for top_features that are in the known feature set
feature_config = {
    "MMSE":  {"label": "MMSE Score (0–30)",          "min": 0,   "max": 30,   "default": 27,   "step": 1,    "help": "Mini-Mental State Exam. Below 24 = impairment."},
    "CDR":   {"label": "CDR (0=Normal, 2=Severe)",   "min": 0.0, "max": 2.0,  "default": 0.0,  "step": 0.5,  "help": "Clinical Dementia Rating. 0.5 = very mild (MCI borderline)."},
    "nWBV":  {"label": "Normalized Brain Volume",    "min": 0.6, "max": 0.9,  "default": 0.75, "step": 0.01, "help": "Fraction of skull volume. Lower = more atrophy."},
    "eTIV":  {"label": "Est. Intracranial Vol (mm³)","min": 1000,"max": 2000, "default": 1500, "step": 10,   "help": "Total skull cavity volume — reference measurement."},
    "ASF":   {"label": "Atlas Scaling Factor",       "min": 0.8, "max": 1.8,  "default": 1.2,  "step": 0.01, "help": "MRI calibration factor for brain size normalization."},
    "Age":   {"label": "Age (years)",                "min": 60,  "max": 96,   "default": 72,   "step": 1,    "help": "Patient age. Risk doubles every 5 years after 65."},
    "M/F":   {"label": "Sex (0=Female, 1=Male)",     "min": 0,   "max": 1,    "default": 0,    "step": 1,    "help": "Biological sex."},
    "EDUC":  {"label": "Years of Education",         "min": 6,   "max": 23,   "default": 14,   "step": 1,    "help": "Higher education = cognitive reserve = delayed onset."},
    "SES":   {"label": "Socioeconomic Status (1–5)", "min": 1,   "max": 5,    "default": 2,    "step": 1,    "help": "1=highest, 5=lowest."},
}

patient_input = {}
for feat in top_features:
    if feat in feature_config:
        cfg = feature_config[feat]
        if isinstance(cfg["step"], float):
            val = st.sidebar.slider(
                cfg["label"], float(cfg["min"]), float(cfg["max"]),
                float(cfg["default"]), cfg["step"], help=cfg["help"])
        else:
            val = st.sidebar.slider(
                cfg["label"], int(cfg["min"]), int(cfg["max"]),
                int(cfg["default"]), cfg["step"], help=cfg["help"])
        patient_input[feat] = val

st.sidebar.markdown("---")
predict_btn = st.sidebar.button("🔍 Predict Alzheimer's Risk", use_container_width=True)

# ── Main content ─────────────────────────────────────────────────
col_info, col_model = st.columns([1, 1], gap="large")

with col_info:
    st.markdown("### 📊 Model Performance")
    m1, m2, m3 = st.columns(3)
    m1.metric("Accuracy",  "90.4%",  "↑ vs Logistic 71.9%")
    m2.metric("F1-Macro",  "0.924",  "5-Fold CV")
    m3.metric("AUC-OvR",   "0.975",  "3-class OvR")

    st.markdown("---")
    st.markdown("### 🧬 How This Works")
    st.markdown("""
**Pipeline:**
1. **OASIS Dataset** — 150 real clinical patients
2. **SMOTE** — Balances the rare "Converted" class
3. **Optuna (50 trials)** — Bayesian hyperparameter tuning
4. **XGBoost** — Regularized gradient boosting (L1 + L2)
5. **SHAP** — Shapley values explain every prediction

**3 Classes Predicted:**
- 🟢 **Normal** — No cognitive impairment
- 🔴 **Demented** — Active Alzheimer's
- 🟡 **Converted** — MCI → Alzheimer's (most clinically valuable)
    """)

with col_model:
    st.markdown("### 🎯 Prediction")
    if not predict_btn:
        st.info("👈 Adjust patient values in the sidebar and click **Predict**")
    else:
        patient_df = pd.DataFrame([patient_input])
        for feat in top_features:
            if feat not in patient_df.columns:
                patient_df[feat] = 0.0

        pred_class = model.predict(patient_df[top_features])[0]
        pred_proba = model.predict_proba(patient_df[top_features])[0]

        # ── Risk stratification ───────────────────────────────────
        tier_label, tier_css, action = stratify_risk(
            float(pred_proba[1]), float(pred_proba[2]))

        st.markdown(f"<div class='{tier_css}'>{tier_label}</div>",
                    unsafe_allow_html=True)

        st.markdown(
            f"<div style='background:#1e2a3a;border-left:4px solid #F39C12;"
            f"padding:10px;border-radius:6px;margin:8px 0'>"
            f"<b style='color:#F39C12'>📋 Recommended Action:</b><br/>"
            f"<span style='color:#eee'>{action}</span></div>",
            unsafe_allow_html=True)

        # ── Conformal uncertainty ─────────────────────────────────
        if CONFORMAL_AVAILABLE:
            _, y_sets, pset = predict_with_uncertainty(
                model, patient_df, top_features, alpha=0.10)
            if pset is not None:
                certain = len(pset) == 1
                pset_str = " · ".join(pset)
                conf_color = "#27AE60" if certain else "#E67E22"
                conf_label = "✅ High confidence" if certain else "⚠️ Ambiguous — needs more data"
                st.markdown(
                    f"<div style='background:#1e2a3a;border-left:4px solid {conf_color};"
                    f"padding:10px;border-radius:6px;margin:8px 0'>"
                    f"<b style='color:{conf_color}'>90% Prediction Set:</b> {pset_str}<br/>"
                    f"<span style='color:#aaa;font-size:0.85em'>{conf_label} — "
                    f"conformal coverage guarantee</span></div>",
                    unsafe_allow_html=True)

        # ── Probability bars ──────────────────────────────────────
        st.markdown("#### Probability Breakdown")
        labels = ["Normal", "Demented", "Converted"]
        colors = {"Normal": "#27ae60", "Demented": "#c0392b", "Converted": "#e67e22"}
        for label, prob in zip(labels, pred_proba):
            pct = prob * 100
            st.markdown(
                f"**{label}** — {pct:.1f}%  "
                f"<div style='background:{colors[label]};width:{pct:.0f}%;height:8px;"
                f"border-radius:4px;margin-bottom:6px'></div>",
                unsafe_allow_html=True)

st.markdown("---")

# ── SHAP Explanation ─────────────────────────────────────────────
if predict_btn and patient_input:
    st.markdown("## 🔍 Explainable AI — Why This Prediction?")
    st.markdown(
        "SHAP (SHapley Additive Explanations) quantifies each feature's contribution "
        "to the prediction. **Red = increases Alzheimer's risk · Blue = decreases risk**"
    )

    patient_df = pd.DataFrame([patient_input])
    for feat in top_features:
        if feat not in patient_df.columns:
            patient_df[feat] = 0.0

    sv, feats = explain_single_patient(model, patient_df, top_features)

    col_shap1, col_shap2 = st.columns([1, 1], gap="large")

    with col_shap1:
        st.markdown("#### Feature Contributions (SHAP Values)")
        fig, ax = plt.subplots(figsize=(7, 4))
        fig.patch.set_facecolor("#1e2a3a")
        ax.set_facecolor("#1e2a3a")
        colors_bar = ["#F44336" if float(v) > 0 else "#2196F3" for v in sv]
        bars = ax.bar(feats, sv, color=colors_bar, edgecolor="white", linewidth=0.5)
        ax.axhline(0, color="white", lw=0.8, linestyle="--", alpha=0.5)
        ax.set_ylabel("SHAP Value", color="white")
        ax.set_title("Local SHAP Explanation — This Patient", color="white", pad=10)
        ax.tick_params(colors="white")
        ax.spines[:].set_color("#2d4a6e")
        for label in ax.get_xticklabels():
            label.set_color("white")
            label.set_rotation(45)
            label.set_ha("right")
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()

    with col_shap2:
        st.markdown("#### Clinical Interpretation")
        rows = sorted(zip(feats, sv), key=lambda x: abs(x[1]), reverse=True)

        clinical_desc = {
            "CDR":  "Clinical Dementia Rating — primary diagnostic instrument",
            "MMSE": "Cognitive test score — lower = more impairment",
            "nWBV": "Brain volume fraction — atrophy biomarker",
            "Age":  "Age — risk doubles every 5 years after 65",
            "EDUC": "Education — cognitive reserve (protective)",
            "SES":  "Socioeconomic status — healthcare access",
            "eTIV": "Skull cavity volume — MRI reference",
            "ASF":  "MRI calibration factor",
            "M/F":  "Biological sex",
        }

        for feat, val in rows:
            direction = "⬆️ Increases risk" if val > 0 else "⬇️ Decreases risk"
            color     = "#F44336" if val > 0 else "#2196F3"
            desc      = clinical_desc.get(feat, feat)
            val_disp  = patient_input.get(feat, "N/A")
            st.markdown(
                f"<div style='background:#1e2a3a;border-left:4px solid {color};"
                f"padding:10px;margin:6px 0;border-radius:6px;'>"
                f"<b style='color:{color}'>{feat}</b> = {val_disp} &nbsp;"
                f"<span style='color:#aaa;font-size:0.85em'>({desc})</span><br/>"
                f"<span style='color:{color}'>{direction}</span> "
                f"<span style='color:#ddd'>| SHAP = {val:+.3f}</span>"
                f"</div>",
                unsafe_allow_html=True,
            )

st.markdown("---")

# ── Model Info Footer ────────────────────────────────────────────
with st.expander("📋 Model Details & References"):
    st.markdown("""
**Model**: XGBoost (multi:softmax, 3-class) with Optuna Bayesian tuning (50 trials, TPE sampler)

**Dataset**: OASIS Longitudinal (Marcus et al., 2010) — 150 patients, 9 clinical features

**Imbalance Handling**: SMOTE (Chawla et al., 2002) applied to training data only

**Explainability**: SHAP TreeExplainer (Lundberg & Lee, 2017) — exact Shapley values via TreeSHAP

**Validation**: 5-Fold Stratified Cross-Validation — F1-Macro: 0.9237 ± 0.0344

**References**:
- Chen & Guestrin (2016). XGBoost: A Scalable Tree Boosting System. KDD.
- Lundberg & Lee (2017). A Unified Approach to Interpreting Model Predictions. NeurIPS.
- Marcus et al. (2010). Open Access Series of Imaging Studies (OASIS). J. Cog. Neurosci.
    """)

st.markdown(
    "<div style='text-align:center;color:#555;font-size:0.8rem;padding:20px 0'>"
    "⚠️ For research and educational purposes only. Not for clinical use without validation."
    "</div>",
    unsafe_allow_html=True,
)
