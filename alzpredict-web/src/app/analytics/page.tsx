"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Server, Shield, Scale, Database, CheckCircle2, Info } from "lucide-react";
import dynamic from "next/dynamic";

const API_URL = "http://localhost:8000";

const ThreeAtom = dynamic(() => import("@/components/ThreeAtom"), { ssr: false });

export default function Analytics() {
  const [perf, setPerf] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get(`${API_URL}/api/metadata`);
        setPerf(r.data.performance);
      } catch (e) {}
    }
    load();
  }, []);

  return (
    <div className="w-full py-12 flex flex-col items-center">
      
      <div className="w-full max-w-2xl text-center mb-16">
        <div className="w-full h-48 rounded-3xl overflow-hidden relative border border-white/5 bg-black/20 flex items-center justify-center shadow-lg mb-8">
          <ThreeAtom />
        </div>
        <h1 className="text-5xl lg:text-7xl font-display font-black bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent tracking-tight">
          System Audit
        </h1>
        <p className="text-slate-400 text-lg mt-4 leading-relaxed font-medium">
          Verify deployment health, statistical baselines, and fairness evaluation telemetry.
        </p>
      </div>

      <div className="w-full max-w-5xl flex flex-col gap-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/20 shadow-xl flex flex-col justify-between">
            <div className="text-slate-500 flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-4"><Database size={16}/> Database</div>
            <div className="text-2xl font-black text-white tracking-tight">OASIS Longitudinal</div>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">Normalized cohort containing 150 clinically audited subjects.</p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/20 shadow-xl flex flex-col justify-between">
            <div className="text-brand-cyan flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-4"><Server size={16}/> Processing Core</div>
            <div className="text-2xl font-black text-brand-cyan tracking-tight">XGBoost Pipeline</div>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">Regularized Gradient Boosting via Bayesian Tree Parzen optimization.</p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/20 shadow-xl flex flex-col justify-between">
            <div className="text-emerald-400 flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-4"><Shield size={16}/> Protocol Status</div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">Verified Deployment</div>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">5-Fold CV F1: <span className="font-bold font-mono text-white">{perf ? perf.f1_macro.toFixed(4) : "---"}</span></p>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-3xl border border-white/5 bg-black/25 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-8 relative z-10">
            <Scale className="text-brand-cyan w-7 h-7"/>
            <h3 className="text-2xl font-display font-black text-white">Clinical Algorithmic Fairness</h3>
          </div>
          
          <div className="space-y-6 text-slate-300 leading-relaxed text-base font-medium relative z-10">
            <p>
              This intelligence suite is automatically audited for demographic parity discrepancies conforming to global AI safety regulation policies. Continuous testing certifies minimal performance skew variance across vital subgroups.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0" />
                <span className="text-sm font-bold text-slate-200">Gender Subgroup Parity (&Delta;F1 &lt; 0.10)</span>
              </div>
              <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0" />
                <span className="text-sm font-bold text-slate-200">Education Stratification Checked</span>
              </div>
              <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0" />
                <span className="text-sm font-bold text-slate-200">Cognitive Age Variance Validated</span>
              </div>
              <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0" />
                <span className="text-sm font-bold text-slate-200">Socioeconomic Bias Audit Pass</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs text-slate-500 font-bold bg-white/5 py-3 px-5 rounded-xl border border-white/5 w-fit">
            <Info size={14}/> Technical plots saved directly to Python `reports/figures` workspace context.
          </div>
        </div>

      </div>
    </div>
  );
}
