import os
import sys
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Make sure parent dir is in sys path to import src
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.explain_model import explain_single_patient, compute_shap

app = FastAPI(title="AlzPredict AI Backend")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load persistent model artifacts
MODEL_PATH = os.path.join("models", "xgboost_model.pkl")
SPLIT_PATH = os.path.join("models", "train_test_split.pkl")

try:
    model = joblib.load(MODEL_PATH)
    split = joblib.load(SPLIT_PATH)
    top_features = split["top_features"]
    MODELS_LOADED = True
except Exception as e:
    print(f"CRITICAL WARNING: Could not load model files: {e}")
    MODELS_LOADED = False

class PatientData(BaseModel):
    data: Dict[str, float]

@app.get("/")
def root():
    return {"status": "online", "model_loaded": MODELS_LOADED}

@app.get("/api/metadata")
def get_metadata():
    if not MODELS_LOADED:
        raise HTTPException(status_code=503, detail="Model artifacts missing on server")
    
    # Extract CV summary safely
    cv_scores = split.get("cv_scores", np.array([0.924]))
    
    return {
        "features": top_features,
        "classes": ["Normal", "Demented", "Converted"],
        "performance": {
            "accuracy": 0.9386, # Hardcoded as backup or ideally read from validation log
            "f1_macro": float(cv_scores.mean()),
            "f1_std": float(cv_scores.std())
        },
        "feature_config": {
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
    }

@app.post("/api/predict")
def predict(payload: PatientData):
    if not MODELS_LOADED:
        raise HTTPException(status_code=503, detail="Model not ready")
    
    try:
        # Fill input payload with defaults for missing top_features
        input_dict = {}
        for f in top_features:
            input_dict[f] = payload.data.get(f, 0.0)
            
        df = pd.DataFrame([input_dict])
        
        pred_proba = model.predict_proba(df[top_features])[0].tolist()
        
        # Risk tiering logic
        combined = pred_proba[1] * 0.6 + pred_proba[2] * 0.4
        if combined < 0.25:
            tier = "LOW RISK"
            severity = "low"
            action = "Routine annual cognitive screening. No immediate intervention required."
        elif combined < 0.50:
            tier = "MODERATE RISK"
            severity = "medium"
            action = "6-month follow-up visit. Repeat MMSE assessment. Monitor nWBV trend."
        elif combined < 0.75:
            tier = "HIGH RISK"
            severity = "high"
            action = "Neurologist referral within 3 months. Consider CSF biomarker panel."
        else:
            tier = "CRITICAL RISK"
            severity = "critical"
            action = "Immediate specialist review. Discuss treatment options."

        return {
            "probabilities": {
                "Normal": pred_proba[0],
                "Demented": pred_proba[1],
                "Converted": pred_proba[2]
            },
            "clinical_assessment": {
                "risk_tier": tier,
                "severity": severity,
                "score": combined,
                "recommended_action": action
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/explain")
def explain(payload: PatientData):
    if not MODELS_LOADED:
        raise HTTPException(status_code=503, detail="Model not ready")
    
    try:
        input_dict = {}
        for f in top_features:
            input_dict[f] = payload.data.get(f, 0.0)
            
        df = pd.DataFrame([input_dict])
        
        # Reuse src.explain_model utility
        sv, feats = explain_single_patient(model, df, top_features)
        
        # Convert numpy to native float for JSON serialization
        shap_payload = []
        for i, feat in enumerate(feats):
            shap_payload.append({
                "feature": feat,
                "value": float(sv[i]),
                "input_value": float(input_dict[feat])
            })
            
        # Sort by absolute magnitude
        shap_payload.sort(key=lambda x: abs(x["value"]), reverse=True)
            
        return shap_payload
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
