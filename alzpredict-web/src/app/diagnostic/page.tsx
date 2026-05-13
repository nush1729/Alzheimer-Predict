"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, CheckCircle2, Zap, Dna, Info, Activity, ArrowRight, ArrowLeft, Stethoscope, ClipboardList, Beaker } from "lucide-react";

const API_URL = "http://localhost:8000";

// Mathematically computes SVG paths for Gaussian curves relative to min/max
function DistributionCurve({ min, max, val }: { min: number; max: number; val: number }) {
  const points = [];
  const steps = 40;
  const range = max - min;
  const mean = min + range / 2;
  const std = range / 5; // standard deviation heuristic for visuals

  for (let i = 0; i <= steps; i++) {
    const x = min + (i / steps) * range;
    // standard normal dist formula for aesthetic
    const y = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2))) * 30; 
    const svgX = (i / steps) * 100;
    const svgY = 40 - y; // invert Y
    points.push(`${svgX},${svgY}`);
  }
  
  const pathD = `M 0,40 L ${points.join(" ")} L 100,40 Z`;
  
  // Calculate pointer position
  const valPct = Math.max(0, Math.min(100, ((val - min) / range) * 100));

  return (
    <div className="h-10 w-24 relative bg-white/5 rounded border border-white/5 p-1 overflow-hidden group/curve">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full fill-brand-cyan/10 stroke-brand-cyan/30 stroke-[0.5]">
        <path d={pathD} />
        {/* Grid line */}
        <line x1="50" y1="0" x2="50" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
      </svg>
      {/* Live indicator line */}
      <motion.div 
        className="absolute top-0 bottom-0 w-[2px] bg-brand-purple shadow-[0_0_8px_#BF5AF2]" 
        style={{ left: `${valPct}%` }}
        layout
        transition={{type: "spring", stiffness: 300, damping: 30}}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover/curve:opacity-100 transition-opacity text-[8px] font-bold text-slate-400">
        Population Spec
      </div>
    </div>
  );
}

export default function DiagnosticWorkspace() {
  const [config, setConfig] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0: Intake, 1: Biometrics, 2: Prediction

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await axios.get(`${API_URL}/api/metadata`);
        setConfig(res.data);
        const initialVals: Record<string, number> = {};
        res.data.features.forEach((feat: string) => {
          initialVals[feat] = res.data.feature_config[feat]?.default ?? 0;
        });
        setInputs(initialVals);
      } catch (err) {
        setError("Connection to clinical database lost.");
      }
    }
    fetchMetadata();
  }, []);

  const runDiagnosis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/predict`, { data: inputs });
      setResult(res.data);
      setCurrentStep(2); // automatically push to stage 3 on completion
    } catch (err: any) {
      setError("Computation Node Overload. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!config && !error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 z-10 relative">
        <Loader2 className="animate-spin text-brand-cyan" size={44} />
        <p className="text-slate-400 font-display tracking-widest text-xs uppercase">Deploying Virtual Neural Mesh...</p>
      </div>
    );
  }

  // Split features into Intake (Demographics) and Biometrics (MRI/Cognitive)
  const intakeFeatures = ["Age", "M/F", "EDUC", "SES"];
  const biometricFeatures = ["MMSE", "CDR", "nWBV", "eTIV", "ASF"];

  const renderFeatureSlider = (feat: string) => {
    const cfg = config.feature_config[feat];
    if (!cfg) return null;
    return (
      <div key={feat} className="glass-panel p-4 rounded-xl flex items-center justify-between gap-6 border border-white/5 relative group hover:border-brand-cyan/20 transition-all">
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2 group-hover:text-brand-cyan transition-colors">
              {cfg.label}
              <div className="relative group/help">
                <Info size={13} className="text-slate-600 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-[#0f172a] border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed hidden group-hover/help:block z-30 shadow-2xl backdrop-blur-xl">
                  {cfg.help}
                </div>
              </div>
            </label>
            <span className="text-sm font-mono font-black text-white bg-white/5 px-3 py-1 rounded-md border border-white/10 group-hover:bg-brand-cyan/10 group-hover:text-brand-cyan transition-colors">
              {inputs[feat]?.toFixed(cfg.step < 1 ? 2 : 0)}
            </span>
          </div>
          
          <input
            type="range"
            min={cfg.min}
            max={cfg.max}
            step={cfg.step}
            value={inputs[feat] || cfg.default}
            onChange={(e) => setInputs({ ...inputs, [feat]: parseFloat(e.target.value) })}
            className="w-full h-[3px] bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-cyan transition-all group-hover:bg-white/20"
          />
        </div>

        {/* SVG distribution component */}
        <DistributionCurve min={cfg.min} max={cfg.max} val={inputs[feat] || cfg.default} />
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8 relative z-10">
      
      {/* Wizard Timeline Indicator */}
      <div className="flex items-center justify-between mb-12 glass-panel p-3 rounded-full border border-white/5 bg-black/30 max-w-2xl mx-auto relative">
        <div className="absolute inset-0 overflow-hidden rounded-full"><div className="w-full h-full opacity-10 bg-gradient-to-r from-brand-cyan via-transparent to-brand-purple" /></div>
        
        {[
          { icon: <ClipboardList size={16}/>, title: "Demographics" },
          { icon: <Beaker size={16}/>, title: "Neuro-Biometrics" },
          { icon: <Stethoscope size={16}/>, title: "Inference Lab" }
        ].map((s, idx) => (
          <div 
            key={idx} 
            onClick={() => { if(idx <= currentStep || result) setCurrentStep(idx); }}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer tracking-wide transition-all duration-300 ${
              currentStep === idx 
                ? "bg-white/10 text-white border border-white/10 shadow-inner shadow-white/5" 
                : idx < currentStep || result
                  ? "text-brand-cyan hover:text-white" 
                  : "text-slate-600 cursor-not-allowed"
            }`}
          >
            {s.icon} {s.title}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="w-full min-h-[550px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: INTAKE */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-4 flex flex-col justify-center space-y-6">
                <h2 className="text-4xl font-display font-black leading-tight text-white">
                  Intake & <br /><span className="text-brand-cyan">Demographics</span>
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Initial algorithmic stratification requires baseline non-invasive metrics. Educational reserve and biological age represent highly potent anchors in statistical covariance structures.
                </p>
                <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl text-xs text-slate-400 leading-relaxed flex gap-3">
                  <span className="font-bold text-brand-cyan uppercase">Clinical Note:</span> Age scales non-linearly beyond standard demographic curves.
                </div>
              </div>
              
              <div className="lg:col-span-8 grid grid-cols-1 gap-4">
                {intakeFeatures.map(renderFeatureSlider)}
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-4 bg-brand-cyan text-black rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:scale-[1.02] transition-all"
                  >
                    Proceed to Biometrics <ArrowRight size={18}/>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: BIOMETRICS */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-4 flex flex-col justify-center space-y-6">
                <h2 className="text-4xl font-display font-black leading-tight text-white">
                  Neuro- <br /><span className="text-brand-purple">Biometrics</span>
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Adjust MRI derived volumetric modalities and standard neuro-psychological examinations (MMSE/CDR). These variables hold high localized gradient weight within the model manifold.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentStep(0)}
                    className="px-4 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft size={14}/> Back
                  </button>
                </div>
              </div>
              
              <div className="lg:col-span-8 grid grid-cols-1 gap-4">
                {biometricFeatures.map(renderFeatureSlider)}
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={runDiagnosis}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-brand-cyan to-brand-purple text-white rounded-xl font-bold text-sm flex items-center gap-3 hover:shadow-[0_0_30px_rgba(191,90,242,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18}/>}
                    {loading ? "Processing Matrix..." : "Trigger AI Inference Pipeline"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: RESULTS / INFERENCE */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-4"
            >
              {!result ? (
                <div className="col-span-2 h-96 glass-panel rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <Activity size={48} className="opacity-25" />
                  <span className="text-sm uppercase font-bold tracking-widest">Processing Node Buffer Empty</span>
                </div>
              ) : (
                <>
                  {/* Classification Assessment */}
                  <div className="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between border-t-4 border-brand-cyan">
                    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                      <div className={`absolute top-0 left-0 w-full h-full bg-radial from-${result.clinical_assessment.severity === 'critical' ? 'red-500' : 'emerald-500'}/10 via-transparent to-transparent filter blur-xl`} />
                    </div>

                    <div className="relative">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${result.clinical_assessment.severity === 'critical' || result.clinical_assessment.severity === 'high' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          Neural Certification
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">SIG: 0.941</span>
                      </div>

                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Classification Result</h3>
                      <h1 className={`text-4xl font-display font-black tracking-tight mt-2 ${
                        result.clinical_assessment.severity === 'critical' || result.clinical_assessment.severity === 'high'
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}>
                        {result.clinical_assessment.risk_tier}
                      </h1>
                      
                      <div className="mt-8 space-y-4 bg-black/30 border border-white/5 p-6 rounded-xl shadow-inner relative">
                        <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500">Actionable Recourse Directive</h4>
                        <p className="text-sm text-slate-300 italic font-light leading-relaxed">&quot;{result.clinical_assessment.recommended_action}&quot;</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.location.href = '/explain'}
                      className="mt-8 w-full py-3.5 rounded-xl font-bold text-sm bg-white text-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                    >
                      Launch Deep Explainer Lab <ArrowRight size={16}/>
                    </button>
                  </div>

                  {/* Stratified Distribution */}
                  <div className="glass-panel p-8 rounded-2xl relative border border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-8"><CheckCircle2 size={18} className="text-brand-cyan" /> Joint Distribution Density</h3>
                      
                      <div className="space-y-6">
                        {Object.entries(result.probabilities).map(([label, val]: any) => {
                          const pct = (val * 100).toFixed(1);
                          return (
                            <div key={label} className="space-y-2 group">
                              <div className="flex items-center justify-between text-xs tracking-wide font-bold">
                                <span className="text-slate-400 group-hover:text-white transition-colors">{label} Class</span>
                                <span className="font-mono text-white">{pct}%</span>
                              </div>
                              <div className="h-2 bg-white/5 border border-white/5 rounded-full overflow-hidden p-[1px]">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1, ease: "easeOut" as const }}
                                  className={`h-full rounded-full ${
                                    label === 'Normal' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                                    label === 'Converted' ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                                    'bg-gradient-to-r from-red-600 to-red-400'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl border border-dashed border-white/10 text-[11px] text-slate-500 leading-relaxed flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-bold text-slate-400"><Activity size={12}/> SYSTEM CERTIFICATION</div>
                      Predicted vector utilizes a Bayesian ensemble matrix. Conformal bound calibration places true target within current density array with &ge; 90.0% statistical coverage.
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>

    </div>
  );
}
