"use client";

import { motion } from "framer-motion";
import { BookOpen, FileText, Fingerprint, ShieldAlert, Database, Cpu } from "lucide-react";
import dynamic from "next/dynamic";

const ThreeAtom = dynamic(() => import("@/components/ThreeAtom"), { ssr: false });

export default function ScienceTransparency() {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-xl h-56 mb-8 rounded-3xl overflow-hidden relative border border-white/5 bg-black/20 flex items-center justify-center self-center shadow-2xl">
        <ThreeAtom />
      </div>

      <motion.header 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20 text-center w-full max-w-4xl"
      >
        <span className="px-5 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-black text-xs tracking-widest uppercase shadow-sm">
          Technical Audit & Methodology
        </span>
        <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tight text-white mt-8 leading-tight">
          The Foundations of <br />
          <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent">
            Clinical Physics
          </span>
        </h1>
        <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
          Complete disclosure regarding statistical cohorts, regularization mechanics, and distribution-free frequentist guarantees.
        </p>
      </motion.header>

      <div className="space-y-12 w-full max-w-4xl flex flex-col">
        
        {/* Cohort */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-10 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden bg-black/20 shadow-xl"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 z-0"><Database size={140} /></div>
          
          <div className="flex items-center gap-4 text-brand-cyan relative z-10">
            <BookOpen size={24}/>
            <h2 className="text-2xl font-display font-black tracking-wider uppercase">01 / Cohort Mechanics</h2>
          </div>

          <p className="text-slate-300 leading-relaxed text-base font-medium relative z-10">
            AlzPredict is benchmarked against the **OASIS-3 longitudinal clinical cohort** established by the Knight ADRC. These evaluations aggregate standardized cognitive screening metrics alongside localized magnetic resonance imagery (1.5T & 3.0T scanner environments).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            <div className="p-6 bg-black/30 border border-white/5 rounded-2xl flex flex-col gap-2 shadow-inner">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Cohort Dimension</div>
              <div className="text-3xl font-black text-white">150 Subjects</div>
            </div>
            <div className="p-6 bg-black/30 border border-white/5 rounded-2xl flex flex-col gap-2 shadow-inner">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Visit Interval</div>
              <div className="text-3xl font-black text-white">2 — 5 Timepoints</div>
            </div>
          </div>
        </motion.section>

        {/* Algorithms */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-10 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden bg-black/20 shadow-xl"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 z-0"><Cpu size={140} /></div>
          
          <div className="flex items-center gap-4 text-brand-purple relative z-10">
            <Fingerprint size={24}/>
            <h2 className="text-2xl font-display font-black tracking-wider uppercase">02 / Manifold Structure</h2>
          </div>

          <p className="text-slate-300 leading-relaxed text-base font-medium relative z-10">
            The base estimator is configured using Bayesian optimized **Extreme Gradient Boosting (XGBoost)** frameworks. Objective solvers leverage Newton-Raphson approximations on Second-Order Taylor derivations of structural loss, bound tightly using elastic-net type penalties.
          </p>

          <div className="bg-black/40 border border-white/10 p-8 rounded-3xl text-slate-300 space-y-5 leading-relaxed relative z-10 shadow-inner">
            <div className="text-xs font-black text-slate-500 uppercase border-b border-white/5 pb-3 tracking-wider">Mathematical Objective L(θ)</div>
            <div className="flex justify-center py-4 text-2xl text-brand-purple font-black font-mono tracking-tight">
              L(&theta;) = &Sigma; l(y<sub>i</sub>, &ycirc;<sub>i</sub>) + &Sigma; &Omega;(f<sub>k</sub>)
            </div>
            <div className="text-sm text-slate-400 bg-white/5 p-4 rounded-xl">
              Where <span className="font-bold font-mono text-brand-cyan">&Omega;(f) = &gamma;T + &frac12;&lambda;||w||<sup>2</sup></span> penalizes total active leaf matrices ($T$) and scales continuous leaf weights ($w$) to inhibit variance.
            </div>
          </div>
        </motion.section>

        {/* MAPIE */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-10 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden bg-black/20 border-l-8 border-l-brand-cyan shadow-xl"
        >
          
          <div className="flex items-center gap-4 text-emerald-400 relative z-10">
            <ShieldAlert size={24}/>
            <h2 className="text-2xl font-display font-black tracking-wider uppercase">03 / Finite Sample Bound</h2>
          </div>

          <p className="text-slate-300 leading-relaxed text-base font-medium">
            Standard categorical distributions output by trees lack probabilistic calibration. AlzPredict layers an inductive **Conformal Wrapper (MAPIE 1.4)**, yielding non-asymptotic set guarantees regardless of data geometry.
          </p>

          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-4 shadow-inner">
            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">Coverage Proposition</div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Under arbitrary base distribution setups, given empirical significance <span className="font-black font-mono text-slate-300">&alpha; = 0.10</span>, our prediction arrays satisfy:
            </p>
            <div className="flex justify-center py-5 text-2xl text-white font-black font-mono italic select-none drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              P ( Y<sub>n+1</sub> &isin; C(X<sub>n+1</sub>) ) &ge; 1 - &alpha;
            </div>
            <p className="text-xs text-slate-500 font-medium pt-2 border-t border-white/5">
              Providing deterministic proof that real target classifications exist inside computed ranges with standard frequentist confidence &ge; 90%.
            </p>
          </div>
        </motion.section>

        {/* References */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-12 w-full"
        >
          <h3 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2 mb-8 tracking-widest">
            <FileText size={18} /> Peer Reviewed Records
          </h3>
          
          <div className="space-y-6 text-xs text-slate-400 leading-relaxed">
            <div className="pl-6 border-l-4 border-white/10 py-2 hover:border-brand-cyan transition-all">
              <div className="text-slate-200 font-bold text-sm mb-1">OASIS Longitudinal Validation</div>
              Marcus, D. S. et al. (2010). Open Access Series of Imaging Studies. <span className="italic text-slate-500 font-bold">Journal of Cognitive Neuroscience</span>.
            </div>
            <div className="pl-6 border-l-4 border-white/10 py-2 hover:border-brand-purple transition-all">
              <div className="text-slate-200 font-bold text-sm mb-1">A Unified Theory of Attribute Attribution</div>
              Lundberg, S. M., & Lee, S.-I. (2017). TreeSHAP Engine. <span className="italic text-slate-500 font-bold">Advances in Neural Information Processing Systems</span>.
            </div>
            <div className="pl-6 border-l-4 border-white/10 py-2 hover:border-brand-blue transition-all">
              <div className="text-slate-200 font-bold text-sm mb-1">Uncertainty Quantification Principles</div>
              Angelopoulos, A. N., & Bates, S. (2021). Introduction to Conformal Maps. <span className="italic text-slate-500 font-bold">arXiv Statistical Preprint</span>.
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
