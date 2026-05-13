"use client";

import { motion } from "framer-motion";
import { BookOpen, FileText, Fingerprint, ShieldAlert, Database, Cpu } from "lucide-react";

export default function ScienceTransparency() {
  return (
    <div className="max-w-4xl mx-auto p-8 relative z-10 py-16">
      
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <span className="px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-mono font-bold text-[10px] tracking-widest uppercase">
          Technical Disclosure & Methodology
        </span>
        <h1 className="text-5xl font-display font-black tracking-tight text-white mt-6 leading-[1.1]">
          The Science of <br />
          <span className="bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
            Cognitive Analytics
          </span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
          Full transparency documentation regarding clinical cohorts, cross-validation frameworks, and conformal calibration guarantees.
        </p>
      </motion.header>

      <div className="space-y-12">
        
        {/* OASIS Artifact */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 text-white/5"><Database size={120} /></div>
          
          <div className="flex items-center gap-3 text-brand-cyan">
            <BookOpen size={20}/>
            <h2 className="text-xl font-display font-black tracking-wide uppercase">01 / Cohort Topology</h2>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm relative z-10">
            AlzPredict is trained using the **OASIS-3 longitudinal clinical cohort** released by the Knight ADRC. The cohort consists of standardized clinical evaluations paired with high-field magnetic resonance imaging (1.5T and 3.0T MRI scans).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Subject Count</div>
              <div className="text-xl font-black text-white">150 Patients</div>
            </div>
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Evaluation Range</div>
              <div className="text-xl font-black text-white">2 to 5 visits / subject</div>
            </div>
          </div>
        </motion.section>

        {/* ML Model Architecture */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 text-white/5"><Cpu size={120} /></div>
          
          <div className="flex items-center gap-3 text-brand-purple">
            <Fingerprint size={20}/>
            <h2 className="text-xl font-display font-black tracking-wide uppercase">02 / Algorithmic Mechanics</h2>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm relative z-10">
            The core engine utilizes a Bayesian-optimized **Extreme Gradient Boosting (XGBoost)** classifier. Non-linear dependencies are captured via tree-split manifolds, and regularized tightly using L1/L2 penalties to prevent overfitting small sample high-dimensional matrices.
          </p>

          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl font-mono text-xs text-slate-300 space-y-4 leading-relaxed relative z-10 shadow-inner">
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-2 border-b border-white/5 pb-2">Objective Function L(θ)</div>
            <div className="flex justify-center py-2 font-display italic font-bold text-lg text-brand-purple">
              L(&theta;) = &Sigma; l(y<sub>i</sub>, &ycirc;<sub>i</sub>) + &Sigma; &Omega;(f<sub>k</sub>)
            </div>
            <p className="text-[10px] text-slate-500">
              Where <span className="italic text-slate-400">&Omega;(f) = &gamma;T + &frac12;&lambda;||w||<sup>2</sup></span> represents the complexity penalty term tracking leaf counts (T) and magnitude weights (w).
            </p>
          </div>
        </motion.section>

        {/* Conformal Calibration */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden border-l-4 border-l-emerald-500"
        >
          
          <div className="flex items-center gap-3 text-emerald-400">
            <ShieldAlert size={20}/>
            <h2 className="text-xl font-display font-black tracking-wide uppercase">03 / Conformal Guarantees</h2>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm">
            Standard softmax outputs are uncalibrated and prone to overconfidence. AlzPredict deploys inductive **Conformal Prediction (via MAPIE)** to provide distribution-free prediction sets. 
          </p>

          <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <div className="text-[10px] font-bold text-emerald-400 uppercase mb-2">Theorem of Coverage</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              For user specified error rate <span className="font-bold font-mono text-slate-300">&alpha; = 0.10</span>, the conformal mapping algorithm guarantees:
            </p>
            <div className="flex justify-center py-3 text-lg text-slate-200 font-mono font-bold italic">
              P ( Y<sub>n+1</sub> &isin; C(X<sub>n+1</sub>) ) &ge; 1 - &alpha;
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Meaning there exists a valid finite-sample frequentist probability &ge; 90% that the correct true clinical classification exists within the predicted uncertainty set.
            </p>
          </div>
        </motion.section>

        {/* References */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-8"
        >
          <h3 className="text-sm font-display font-black uppercase text-slate-500 flex items-center gap-2 mb-6">
            <FileText size={16} /> Academic References
          </h3>
          
          <div className="space-y-4 text-[11px] text-slate-400 leading-relaxed">
            <div className="pl-4 border-l-2 border-white/10 py-1">
              <span className="text-white font-bold">OASIS Longitudinal:</span> Marcus, D. S. et al. (2010). Open Access Series of Imaging Studies: Longitudinal MRI Data in Nondemented and Demented Older Adults. <span className="italic text-slate-500">Journal of Cognitive Neuroscience</span>.
            </div>
            <div className="pl-4 border-l-2 border-white/10 py-1">
              <span className="text-white font-bold">SHAP Explainability:</span> Lundberg, S. M., & Lee, S.-I. (2017). A Unified Approach to Interpreting Model Predictions. <span className="italic text-slate-500">Advances in Neural Information Processing Systems</span>.
            </div>
            <div className="pl-4 border-l-2 border-white/10 py-1">
              <span className="text-white font-bold">Conformal Maps:</span> Angelopoulos, A. N., & Bates, S. (2021). A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification. <span className="italic text-slate-500">arXiv preprint</span>.
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
