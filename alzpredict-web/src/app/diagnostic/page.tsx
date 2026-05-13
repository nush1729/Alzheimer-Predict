"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, CheckCircle2, Zap, Info, Activity, ArrowRight, ArrowLeft, ClipboardList, Beaker, ShieldAlert, Fingerprint } from "lucide-react";
import dynamic from "next/dynamic";

const API_URL = "http://localhost:8000";

// Dynamically import Three-Fiber components to prevent SSR issues
const ThreeAtom = dynamic(() => import("@/components/ThreeAtom"), { ssr: false });
const ThreeDoctor = dynamic(() => import("@/components/ThreeDoctor"), { ssr: false });

function DistributionCurve({ min, max, val }: { min: number; max: number; val: number }) {
  const points = [];
  const steps = 40;
  const range = max - min;
  const mean = min + range / 2;
  const std = range / 5;

  for (let i = 0; i <= steps; i++) {
    const x = min + (i / steps) * range;
    const y = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2))) * 30; 
    const svgX = (i / steps) * 100;
    const svgY = 40 - y;
    points.push(`${svgX},${svgY}`);
  }
  
  const pathD = `M 0,40 L ${points.join(" ")} L 100,40 Z`;
  const valPct = Math.max(0, Math.min(100, ((val - min) / range) * 100));

  return (
    <div className="h-12 w-28 relative bg-white/5 rounded-lg border border-white/5 p-1 overflow-hidden group/curve shrink-0">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full fill-brand-cyan/10 stroke-brand-cyan/30 stroke-[0.5]">
        <path d={pathD} />
        <line x1="50" y1="0" x2="50" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
      </svg>
      <motion.div 
        className="absolute top-0 bottom-0 w-[2px] bg-brand-purple shadow-[0_0_8px_#8B5CF6]" 
        style={{ left: `${valPct}%` }}
        layout
        transition={{type: "spring", stiffness: 300, damping: 30}}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover/curve:opacity-100 transition-opacity text-[9px] font-black tracking-wider text-slate-300 uppercase">
        Normative Spec
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
  const [currentStep, setCurrentStep] = useState(0);

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
      setCurrentStep(2);
    } catch (err: any) {
      setError("Computation Node Overload. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!config && !error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-brand-cyan w-12 h-12" />
        <p className="text-slate-400 font-display tracking-widest text-sm uppercase font-bold">Configuring Clinical Workspace...</p>
      </div>
    );
  }

  const intakeFeatures = ["Age", "M/F", "EDUC", "SES"];
  const biometricFeatures = ["MMSE", "CDR", "nWBV", "eTIV", "ASF"];

  const renderFeatureSlider = (feat: string) => {
    const cfg = config.feature_config[feat];
    if (!cfg) return null;
    return (
      <div key={feat} className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-6 border border-white/5 relative group hover:border-brand-cyan/30 transition-all bg-black/10">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-base font-bold text-slate-200 flex items-center gap-2.5 group-hover:text-brand-cyan transition-colors">
              {cfg.label}
              <div className="relative group/help">
                <Info size={16} className="text-slate-600 cursor-help hover:text-slate-400" />
                <div className="absolute left-0 bottom-full mb-3 w-64 p-4 bg-[#0c0c12] border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed hidden group-hover/help:block z-30 shadow-2xl backdrop-blur-xl">
                  {cfg.help}
                </div>
              </div>
            </label>
            <span className="text-base font-mono font-black text-white bg-white/5 px-3.5 py-1.5 rounded-lg border border-white/10 group-hover:bg-brand-cyan/10 group-hover:text-brand-cyan transition-all">
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
            className="w-full h-[4px] bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-cyan transition-all group-hover:bg-white/20"
          />
        </div>

        <DistributionCurve min={cfg.min} max={cfg.max} val={inputs[feat] || cfg.default} />
      </div>
    );
  };

  return (
    <div className="w-full py-10 flex flex-col items-center justify-center">
      
      {/* Symmetrical Wizard Timeline */}
      <div className="flex items-center justify-between mb-16 glass-panel p-4 rounded-full border border-white/5 bg-black/40 w-full max-w-3xl relative">
        {[
          { icon: <ClipboardList size={18}/>, title: "Demographics" },
          { icon: <Beaker size={18}/>, title: "Neuro-Biometrics" },
          { icon: <Fingerprint size={18}/>, title: "Inference Lab" }
        ].map((s, idx) => (
          <div 
            key={idx} 
            onClick={() => { if(idx <= currentStep || result) setCurrentStep(idx); }}
            className={`relative flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold cursor-pointer tracking-wider transition-all duration-300 ${
              currentStep === idx 
                ? "bg-brand-cyan text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                : idx < currentStep || result
                  ? "text-brand-cyan hover:text-white hover:bg-white/5" 
                  : "text-slate-600 cursor-not-allowed"
            }`}
          >
            {s.icon} {s.title}
          </div>
        ))}
      </div>

      {error && (
        <div className="w-full max-w-4xl mb-8 p-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-4 text-base">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <div className="w-full max-w-6xl min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: INTAKE */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-5 flex flex-col space-y-8 pr-4">
                <div className="w-full h-48 rounded-2xl overflow-hidden relative border border-white/5 bg-black/20">
                  <ThreeAtom />
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl lg:text-6xl font-display font-black leading-tight text-white tracking-tight">
                    Cohort <br /><span className="bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">Intake</span>
                  </h2>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Initial demographic stratification requires baseline non-invasive metrics. Synaptic reserve anchors model covariance structures.
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-7 grid grid-cols-1 gap-5">
                {intakeFeatures.map(renderFeatureSlider)}
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="px-10 py-5 bg-brand-cyan text-black rounded-2xl font-black text-base flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-all uppercase tracking-wider"
                  >
                    Enter Biometrics <ArrowRight size={20}/>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: BIOMETRICS */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-5 flex flex-col space-y-8 pr-4">
                <div className="w-full h-48 rounded-2xl overflow-hidden relative border border-white/5 bg-black/20">
                  <ThreeAtom />
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl lg:text-6xl font-display font-black leading-tight text-white tracking-tight">
                    Biometric <br /><span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">Mapping</span>
                  </h2>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Adjust MRI volumetric indices and neuro-cognitive measurements. These variables dominate localized decision boundaries.
                  </p>
                  <div className="flex pt-2">
                    <button 
                      onClick={() => setCurrentStep(0)}
                      className="px-5 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <ArrowLeft size={16}/> Previous
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-7 grid grid-cols-1 gap-5">
                {biometricFeatures.map(renderFeatureSlider)}
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={runDiagnosis}
                    disabled={loading}
                    className="px-10 py-5 bg-gradient-to-r from-brand-cyan to-brand-purple text-white rounded-2xl font-black text-base flex items-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-wider"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Zap size={20}/>}
                    {loading ? "Processing Nodes..." : "Certify Inference"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: RESULTS WIDESCREEN MATRIX */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 py-4 items-stretch"
            >
              {!result ? (
                <div className="xl:col-span-12 h-96 glass-panel rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-4 bg-black/10">
                  <Activity size={64} className="opacity-20" />
                  <span className="text-base uppercase font-black tracking-widest">Empty Analytical Buffer</span>
                </div>
              ) : (
                <>
                  {/* COLUMN 1: Holographic 3D Doctor Scanning Visualizer */}
                  <div className="xl:col-span-4 h-[420px] xl:h-auto glass-panel rounded-3xl relative overflow-hidden border border-white/5 bg-black/25 shadow-2xl flex flex-col justify-center items-center p-2">
                    <ThreeDoctor 
                      severity={result.clinical_assessment.severity} 
                      riskTier={result.clinical_assessment.risk_tier} 
                    />
                  </div>

                  {/* COLUMN 2: Clinical Certification Assessment */}
                  <div className={`xl:col-span-4 glass-panel p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between bg-black/30 shadow-2xl border-t-8 border-x border-b border-x-white/5 border-b-white/5 ${
                    result.clinical_assessment.severity === 'critical' || result.clinical_assessment.severity === 'high'
                      ? "border-t-red-500" : result.clinical_assessment.severity === 'moderate' ? "border-t-amber-500" : "border-t-brand-cyan"
                  }`}>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-xs font-black tracking-widest uppercase px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 flex items-center gap-2.5">
                          <ShieldAlert size={16} className={`${result.clinical_assessment.severity === 'critical' || result.clinical_assessment.severity === 'high' ? 'text-red-500' : 'text-brand-cyan'}`} />
                          AI Certification
                        </span>
                        <span className="text-xs font-mono font-black text-slate-500 tracking-wider">COV: 90.0%</span>
                      </div>

                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Diagnostic Status</h3>
                      <h1 className={`text-5xl font-display font-black tracking-tighter mt-3 ${
                        result.clinical_assessment.severity === 'critical' || result.clinical_assessment.severity === 'high'
                          ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : result.clinical_assessment.severity === 'moderate'
                            ? "text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            : "text-brand-cyan drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      }`}>
                        {result.clinical_assessment.risk_tier}
                      </h1>
                      
                      <div className="mt-8 bg-black/40 border border-white/5 p-8 rounded-2xl shadow-inner">
                        <h4 className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3">Required Protocol</h4>
                        <p className="text-base text-slate-200 italic leading-relaxed font-medium">&ldquo;{result.clinical_assessment.recommended_action}&rdquo;</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.location.href = '/explain'}
                      className="mt-8 w-full py-5 rounded-2xl font-black text-base bg-white text-black flex items-center justify-center gap-3 hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider shadow-xl"
                    >
                      Explore Interpretability <ArrowRight size={20}/>
                    </button>
                  </div>

                  {/* COLUMN 3: Probability Densities Vector */}
                  <div className="xl:col-span-4 glass-panel p-10 rounded-3xl relative border border-white/5 flex flex-col justify-between bg-black/30 shadow-2xl">
                    <div>
                      <h3 className="text-lg font-black text-slate-200 flex items-center gap-3 mb-8"><CheckCircle2 size={22} className="text-brand-cyan" /> Probability Densities</h3>
                      
                      <div className="space-y-6">
                        {Object.entries(result.probabilities).map(([label, val]: any) => {
                          const pct = (val * 100).toFixed(1);
                          return (
                            <div key={label} className="space-y-3 group">
                              <div className="flex items-center justify-between text-sm tracking-wider font-black uppercase">
                                <span className="text-slate-400 group-hover:text-white transition-colors">{label} Node</span>
                                <span className="font-mono text-white text-base">{pct}%</span>
                              </div>
                              <div className="h-3 bg-white/5 border border-white/10 rounded-full overflow-hidden p-[2px]">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className={`h-full rounded-full ${
                                    label === 'Normal' ? 'bg-gradient-to-r from-emerald-600 to-brand-cyan' :
                                    label === 'Converted' ? 'bg-gradient-to-r from-indigo-600 to-brand-blue' :
                                    'bg-gradient-to-r from-red-600 to-red-400'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 p-6 rounded-2xl border border-dashed border-white/10 text-xs text-slate-400 leading-relaxed flex flex-col gap-3 bg-black/20">
                      <div className="flex items-center gap-2 font-black text-slate-300 uppercase tracking-widest"><Activity size={14}/> Statistical Bounds</div>
                      This pipeline utilizes Bayesian optimized gradient boosting. Conformal calibration certifies frequentist bounds covering ground truth predictions &ge; 90.0%.
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
