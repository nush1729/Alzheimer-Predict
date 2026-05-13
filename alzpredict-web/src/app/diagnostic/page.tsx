"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { AlertCircle, Loader2, CheckCircle2, Zap, Dna, Info, Activity } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function DiagnosticWorkspace() {
  const [config, setConfig] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await axios.get(`${API_URL}/api/metadata`);
        setConfig(res.data);
        // Initialize default values
        const initialVals: Record<string, number> = {};
        res.data.features.forEach((feat: string) => {
          initialVals[feat] = res.data.feature_config[feat]?.default ?? 0;
        });
        setInputs(initialVals);
      } catch (err) {
        setError("Backend Disconnected. Please ensure the FastAPI backend is running at :8000.");
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
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to secure prediction result.");
    } finally {
      setLoading(false);
    }
  };

  if (!config && !error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-brand-cyan" size={40} />
        <p className="text-slate-400 font-display">Establishing connection to NeuroGrid Backend...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      <header className="mb-12">
        <h1 className="text-4xl font-display font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Diagnostic Workspace
        </h1>
        <p className="text-slate-400 mt-2">Adjust clinical modalities to calculate localized risk variance.</p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-8 rounded-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-cyan to-transparent" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <Dna className="text-brand-cyan" size={20} /> Patient Phenotypes
              </h3>
              <button 
                onClick={runDiagnosis}
                disabled={loading}
                className="px-6 py-2 bg-brand-cyan text-black rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                {loading ? "Processing" : "Evaluate"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4">
              {config?.features?.map((feat: string) => {
                const cfg = config.feature_config[feat];
                if (!cfg) return null;
                return (
                  <div key={feat} className="space-y-3 group">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300 group-hover:text-brand-cyan transition-colors flex items-center gap-2">
                        {cfg.label}
                        <div className="relative group/info">
                          <Info size={13} className="text-slate-500 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 hidden group-hover/info:block z-20 backdrop-blur-xl">
                            {cfg.help}
                          </div>
                        </div>
                      </label>
                      <span className="text-sm font-display font-bold text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10">
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
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-cyan accent-ring-brand-cyan hover:bg-white/20 transition-colors"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] glass-panel rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                  <Activity size={32} className="opacity-50" />
                </div>
                <h4 className="text-lg font-display font-bold text-slate-400">Awaiting Input Vector</h4>
                <p className="text-sm text-slate-600 mt-2 max-w-xs">Configure patient parameters and deploy compute trigger to observe diagnostics.</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col gap-6"
              >
                
                {/* Risk Badge */}
                <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden border-l-4 ${
                  result.clinical_assessment.severity === 'critical' || result.clinical_assessment.severity === 'high'
                    ? 'border-l-red-500'
                    : 'border-l-emerald-500'
                }`}>
                  <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">Diagnosis Output</h4>
                  <div className={`text-3xl font-display font-black tracking-tight ${
                    result.clinical_assessment.severity === 'critical' || result.clinical_assessment.severity === 'high'
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}>
                    {result.clinical_assessment.risk_tier}
                  </div>
                  <div className="mt-4 p-4 bg-black/20 border border-white/5 rounded-xl text-sm text-slate-300 italic">
                    &quot;{result.clinical_assessment.recommended_action}&quot;
                  </div>
                </div>

                {/* Probabilities Visual */}
                <div className="glass-panel p-6 rounded-2xl space-y-6 flex-1">
                  <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Probability Distribution
                  </h4>

                  <div className="space-y-4">
                    {Object.entries(result.probabilities).map(([label, val]: any) => {
                      const percentage = (val * 100).toFixed(1);
                      return (
                        <div key={label} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-300">{label}</span>
                            <span className="font-bold font-display">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" as const }}
                              className={`h-full ${
                                label === 'Normal' ? 'bg-emerald-500' :
                                label === 'Converted' ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
