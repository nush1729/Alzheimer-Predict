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
      <section className="relative w-full min-h-[85vh] flex items-center py-12 md:py-20 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full z-10 max-w-7xl mx-auto px-6 md:px-12">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-8 order-2 lg:order-1"
          >
            <motion.div variants={itemVariants} className="flex items-center space-x-3 px-4 py-2 w-fit bg-brand-cyan/10 border border-brand-cyan/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="text-xs font-black text-brand-cyan tracking-widest uppercase">System Status: Operational</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl xl:text-7xl font-display font-black tracking-tight leading-[1.1] text-white">
              Mapping the <br />
              <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent bg-300% animate-glow-pulse select-none">
                Human Brain
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-slate-400 max-w-lg font-medium leading-relaxed">
              Next-generation Enterprise AI solution for pre-emptive Alzheimer&apos;s detection. Powered by non-linear gradient boosting and localized SHAP geometry.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
              <Link href="/diagnostic" className="flex items-center gap-2 px-8 py-4 bg-brand-cyan text-black font-black rounded-2xl hover:scale-[1.03] hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_35px_rgba(16,185,129,0.3)] select-none uppercase tracking-wider text-sm">
                Launch Diagnostics <ArrowRight size={18} />
              </Link>
              <Link href="/explain" className="glass-panel flex items-center gap-2 px-8 py-4 text-slate-200 font-black text-sm tracking-wider uppercase rounded-2xl hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 select-none">
                Explore the Engine
              </Link>
            </motion.div>
          </motion.div>

          {/* 3D Wrapper */}
          <div className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] order-1 lg:order-2 select-none">
            <ThreeBrain />
            {/* Floating Data Point overlays for UX decoration */}
            <div className="absolute top-1/4 right-4 md:right-10 glass-panel px-6 py-4 rounded-2xl border border-brand-cyan/20 animate-float backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-2 text-[10px] text-brand-cyan uppercase font-black tracking-widest"><Activity size={14} /> Accuracy</div>
              <div className="text-3xl font-display font-black mt-1 text-white">93.8%</div>
            </div>
            <div className="absolute bottom-1/4 left-4 md:left-0 glass-panel px-6 py-4 rounded-2xl border border-brand-purple/20 animate-float backdrop-blur-md shadow-2xl" style={{animationDelay: '2.5s'}}>
              <div className="flex items-center gap-2 text-[10px] text-brand-purple uppercase font-black tracking-widest"><Brain size={14} /> AUC-ROC</div>
              <div className="text-3xl font-display font-black mt-1 text-white">0.991</div>
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
