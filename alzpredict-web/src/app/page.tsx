"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Activity, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";

// Dynamically load three component so it doesn't attempt SSR
const ThreeBrain = dynamic(() => import("@/components/ThreeBrain"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-brand-cyan/40 animate-pulse">
      Initializing Neural Engine...
    </div>
  ),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center px-8 lg:px-20 overflow-hidden border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full z-10 max-w-7xl mx-auto">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-8"
          >
            <motion.div variants={itemVariants} className="flex items-center space-x-3 px-4 py-2 w-fit bg-brand-blue/10 border border-brand-blue/20 rounded-full">
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
              <span className="text-xs font-bold text-brand-cyan tracking-widest uppercase">System Status: Operational</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-display font-black tracking-tight leading-[1.1]">
              Mapping the <br />
              <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent bg-300% animate-glow-pulse">
                Human Brain
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-slate-400 max-w-lg font-light leading-relaxed">
              Next-generation Enterprise AI solution for pre-emptive Alzheimer&apos;s detection. Powered by non-linear gradient boosting and localized SHAP geometry.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link href="/diagnostic" className="flex items-center gap-2 px-8 py-4 bg-brand-cyan text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,245,255,0.3)]">
                Launch Diagnostics <ArrowRight size={18} />
              </Link>
              <Link href="/explain" className="glass-panel flex items-center gap-2 px-8 py-4 text-white font-medium rounded-xl glass-panel-hover border border-white/10 hover:border-white/20">
                Explore the Engine
              </Link>
            </motion.div>
          </motion.div>

          {/* 3D Wrapper */}
          <div className="relative w-full h-[500px] lg:h-[600px]">
            <ThreeBrain />
            {/* Floating Data Point overlays for UX decoration */}
            <div className="absolute top-1/4 right-10 glass-panel p-4 rounded-xl border border-brand-cyan/20 animate-float">
              <div className="flex items-center gap-2 text-xs text-brand-cyan uppercase font-bold"><Activity size={14} /> Accuracy</div>
              <div className="text-2xl font-display font-bold mt-1">93.8%</div>
            </div>
            <div className="absolute bottom-1/4 left-0 glass-panel p-4 rounded-xl border border-brand-purple/20 animate-float" style={{animationDelay: '2.5s'}}>
              <div className="flex items-center gap-2 text-xs text-brand-purple uppercase font-bold"><Brain size={14} /> AUC-ROC</div>
              <div className="text-2xl font-display font-bold mt-1">0.991</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Values Section */}
      <section className="w-full py-24 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {[
            { icon: <ShieldCheck className="text-brand-cyan" />, title: "Responsible AI", desc: "Passes dynamic demographic bias auditing compliance matching EU AI Act Article 10 standards." },
            { icon: <Activity className="text-brand-purple" />, title: "Real-time Inference", desc: "Milliseconds evaluation latency powered by serialized XGBoost optimized runtime pipelines." },
            { icon: <BarChart3 className="text-brand-blue" />, title: "Complete Audibility", desc: "SHAP explainability guarantees transparency on every clinical node weight calculation." },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col gap-4"
            >
              <div className="p-3 w-fit rounded-xl bg-white/5 border border-white/10">
                {item.icon}
              </div>
              <h3 className="text-xl font-display font-bold mt-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
          
        </div>
      </section>

    </div>
  );
}
