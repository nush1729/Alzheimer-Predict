"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Loader2, Search, Network, GitBranch, Compass, Info, ArrowRight, RefreshCcw, ChevronsRight, Fingerprint, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const API_URL = "http://localhost:8000";

// Load 3D element
const ThreeAtom = dynamic(() => import("@/components/ThreeAtom"), { ssr: false });

export default function ExplainLab() {
  const [activeTab, setActiveTab] = useState<"shap" | "recourse" | "pdp">("shap");
  const [config, setConfig] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [shapData, setShapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [recourse, setRecourse] = useState<any>(null);
  const [recourseLoading, setRecourseLoading] = useState(false);

  const [pdpData, setPdpData] = useState<any>(null);
  const [pdpLoading, setPdpLoading] = useState(false);
  const [pdpX, setPdpX] = useState("MMSE");
  const [pdpY, setPdpY] = useState("nWBV");

  useEffect(() => {
    async function init() {
      try {
        const res = await axios.get(`${API_URL}/api/metadata`);
        setConfig(res.data);
        const def: Record<string, number> = {};
        res.data.features.forEach((f: string) => {
          def[f] = res.data.feature_config[f]?.default || 0;
        });
        setInputs(def);
      } catch (e) {}
    }
    init();
  }, []);

  const fetchShap = async () => {
    if (Object.keys(inputs).length === 0) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/explain`, { data: inputs });
      setShapData(res.data);
    } catch (e) {}
    setLoading(false);
  };

  const fetchRecourse = async () => {
    setRecourseLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/counterfactual`, { data: inputs });
      setRecourse(res.data);
    } catch (e) {}
    setRecourseLoading(false);
  };

  const fetchPdp = async () => {
    setPdpLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/pdp`, {
        feature_x: pdpX,
        feature_y: pdpY,
        base_data: inputs
      });
      setPdpData(res.data);
    } catch (e) {}
    setPdpLoading(false);
  };

  useEffect(() => {
    if (Object.keys(inputs).length > 0) {
      fetchShap();
      fetchRecourse();
      fetchPdp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  useEffect(() => {
    if (Object.keys(inputs).length > 0) {
      fetchPdp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdpX, pdpY]);

  if (!config) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-brand-purple w-12 h-12" />
        <p className="text-slate-400 font-display tracking-widest text-sm uppercase font-bold">Initializing Interpretation Matrix...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-10 flex flex-col items-center">
      
      <header className="mb-16 text-center w-full max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-4 text-brand-purple">
          <Fingerprint size={28} />
          <span className="text-xs tracking-widest uppercase font-black bg-white/5 border border-white/10 px-4 py-2 rounded-full">Interpretable Intelligence</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tight bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
          Interpretation Suite
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          Deconstruct multi-dimensional model manifolds into human-verifiable clinical rationales.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch w-full max-w-7xl">
        
        {/* Left: Sticky Feature Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col h-full bg-black/20">
            <div className="h-32 rounded-2xl overflow-hidden border border-white/5 mb-6 bg-black/20 flex items-center justify-center">
              <ThreeAtom />
            </div>

            <h3 className="font-display font-black text-xl flex items-center gap-3 text-slate-100 mb-6">
              <Search size={20} className="text-brand-purple" /> Local Vector
            </h3>

            <div className="space-y-3 flex-1 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
              {config.features.map((f: string) => (
                <div key={f} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-brand-purple/5 transition-all">
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{config.feature_config[f]?.label.split('(')[0]}</span>
                  <span className="text-base font-mono font-black text-brand-cyan bg-black/40 px-3 py-1 rounded-lg border border-white/5 group-hover:border-brand-cyan/20">{inputs[f]?.toFixed(config.feature_config[f]?.step < 1 ? 2 : 0)}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => window.location.href = '/diagnostic'}
              className="mt-8 w-full py-5 rounded-2xl text-sm font-black tracking-widest uppercase bg-brand-purple/10 border border-brand-purple/30 text-brand-purple hover:bg-brand-purple hover:text-white transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              Reconfigure Signature <RefreshCcw size={16}/>
            </button>
          </div>
        </div>

        {/* Right: Analytics Center */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          
          <div className="flex gap-3 glass-panel p-2 rounded-2xl border border-white/5 bg-black/30 self-start w-full sm:w-auto overflow-x-auto">
            {[
              { id: "shap", label: "SHAP Matrix", icon: <Network size={16}/> },
              { id: "recourse", label: "Algorithmic Recourse", icon: <GitBranch size={16}/> },
              { id: "pdp", label: "Topography (PDP)", icon: <Compass size={16}/> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === t.id 
                    ? "bg-brand-purple text-white shadow-[0_0_25px_rgba(139,92,246,0.3)] border border-brand-purple/40" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="glass-panel p-10 rounded-3xl flex-1 min-h-[500px] flex flex-col relative border border-white/5 bg-black/20 overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: SHAP */}
              {activeTab === "shap" && (
                <motion.div
                  key="shap"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="h-full flex flex-col flex-1"
                >
                  <div className="flex justify-between items-start mb-10 gap-4">
                    <div>
                      <h3 className="text-2xl font-display font-black text-white tracking-tight">SHAP Gradient Topology</h3>
                      <p className="text-xs text-slate-500 tracking-widest font-black mt-1 uppercase">Contribution attributions relative to statistical base rate</p>
                    </div>
                    <div className="hidden md:flex items-center gap-5 text-xs uppercase font-black tracking-wider shrink-0">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500 opacity-85" /> Promotes Risk</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-blue opacity-85" /> Inhibits Risk</div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-purple w-10 h-10"/></div>
                  ) : shapData.length > 0 ? (
                    <div className="flex-1 min-h-[350px] w-full relative z-10 bg-black/10 p-4 rounded-2xl border border-white/5">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shapData} layout="vertical" margin={{ top: 10, right: 40, left: 25, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                          <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => v.toFixed(2)} fontWeight="bold" />
                          <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.7)" fontSize={11} fontWeight="black" width={75} axisLine={false} />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            contentStyle={{ backgroundColor: '#09090d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', fontSize: '12px', color: '#fff' }}
                          />
                          <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                            {shapData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.value > 0 ? "#ef4444" : "#6366F1"} opacity={0.9} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                  
                  <div className="mt-8 p-6 bg-black/30 border border-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed flex gap-4">
                    <Info size={18} className="text-brand-purple shrink-0 pt-0.5" />
                    <span>Values reflect game-theoretic feature weight gradients shifting output logits from base rates. Total aggregation matches cumulative prediction offsets.</span>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Recourse */}
              {activeTab === "recourse" && (
                <motion.div
                  key="recourse"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="h-full flex flex-col flex-1"
                >
                  <div className="mb-10">
                    <h3 className="text-2xl font-display font-black text-white tracking-tight">Counterfactual Algorithmic Recourse</h3>
                    <p className="text-xs text-slate-500 tracking-widest font-black mt-1 uppercase">Targeted vector adjustments required to invert classification state</p>
                  </div>

                  {recourseLoading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-cyan w-10 h-10"/></div>
                  ) : recourse ? (
                    <div className="flex-1 flex flex-col justify-center gap-10 py-4 relative z-10">
                      
                      <div className="p-6 rounded-2xl border border-white/5 bg-black/40 shadow-inner">
                        <p className="text-base leading-relaxed font-medium text-slate-200 italic">&ldquo;{recourse.message}&rdquo;</p>
                      </div>

                      {recourse.changes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {recourse.changes.map((ch: any, i: number) => (
                            <div key={i} className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-brand-cyan/30 bg-black/10 flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black tracking-widest uppercase text-brand-cyan bg-brand-cyan/10 px-3 py-1.5 rounded-lg">{ch.feature} Optimal Node</span>
                                <GitBranch size={18} className="text-brand-cyan opacity-70" />
                              </div>
                              <div className="flex items-center justify-between bg-black/35 rounded-xl p-5 border border-white/5">
                                <div className="flex-1">
                                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Current</div>
                                  <div className="text-2xl font-black font-mono text-slate-400 mt-1">{ch.original.toFixed(ch.original < 2 ? 2 : 0)}</div>
                                </div>
                                <ChevronsRight className="text-brand-cyan shrink-0" size={24} />
                                <div className="flex-1 pl-4 text-right">
                                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Target</div>
                                  <div className="text-3xl font-black font-mono text-brand-cyan mt-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{ch.target.toFixed(ch.target < 2 ? 2 : 0)}</div>
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 mt-4 font-bold text-center bg-white/5 py-2 rounded-lg">Task: {ch.description}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-52 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500 gap-4 bg-black/10">
                          <CheckCircle2 size={36} className="opacity-30" />
                          <span className="text-sm uppercase font-black tracking-widest">Nominal Certification Restored</span>
                        </div>
                      )}
                      
                    </div>
                  ) : null}
                </motion.div>
              )}

              {/* Tab 3: PDP */}
              {activeTab === "pdp" && (
                <motion.div
                  key="pdp"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="h-full flex flex-col flex-1"
                >
                  <div className="flex flex-wrap justify-between items-center gap-6 mb-10">
                    <div>
                      <h3 className="text-2xl font-display font-black text-white tracking-tight">Partial Dependence Topography</h3>
                      <p className="text-xs text-slate-500 tracking-widest font-black mt-1 uppercase">Non-linear combined probability response grid</p>
                    </div>
                    
                    <div className="flex items-center gap-3 z-20">
                      <select 
                        value={pdpX} 
                        onChange={(e) => setPdpX(e.target.value)} 
                        className="bg-[#09090d] text-slate-300 text-xs font-black uppercase border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-purple cursor-pointer shadow-md"
                      >
                        {config.features.map((f: string) => <option key={f} value={f}>Axis 1: {f}</option>)}
                      </select>
                      <select 
                        value={pdpY} 
                        onChange={(e) => setPdpY(e.target.value)}
                        className="bg-[#09090d] text-slate-300 text-xs font-black uppercase border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-purple cursor-pointer shadow-md"
                      >
                        {config.features.map((f: string) => <option key={f} value={f}>Axis 2: {f}</option>)}
                      </select>
                    </div>
                  </div>

                  {pdpLoading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-purple w-10 h-10"/></div>
                  ) : pdpData ? (
                    <div className="flex-1 flex flex-col relative z-10">
                      <div className="flex items-center justify-between text-[11px] font-black text-slate-400 mb-4 tracking-wider uppercase bg-black/25 px-4 py-2.5 rounded-xl border border-white/5">
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /> Certified Target Bounds</span>
                        <span className="flex items-center gap-2">Critical Hyperplane <div className="w-3 h-3 rounded bg-red-500" /></span>
                      </div>

                      <div className="w-full aspect-[2/1] max-h-[320px] border-2 border-white/10 rounded-2xl overflow-hidden bg-black grid grid-cols-15 shadow-2xl transition-all">
                        {pdpData.grid.map((cell: any, idx: number) => {
                          const hue = 140 - cell.risk * 140; // 140(emerald) down to 0(red)
                          const light = 20 + cell.risk * 25;
                          return (
                            <div 
                              key={idx}
                              style={{ backgroundColor: `hsla(${hue}, 85%, ${light}%, ${0.15 + cell.risk * 0.8})` }}
                              className="w-full h-full border-[0.5px] border-black/30 hover:scale-110 hover:z-20 cursor-pointer transition-all group/cell relative"
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-950 text-[10px] font-mono text-slate-200 px-3 py-1.5 rounded-lg hidden group-hover/cell:block z-30 whitespace-nowrap border border-slate-700 pointer-events-none font-black uppercase tracking-wider shadow-2xl">
                                P(Risk): {(cell.risk*100).toFixed(1)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-8 flex items-center justify-center gap-5 text-sm font-display font-black text-slate-400 uppercase tracking-wider bg-white/5 py-3 rounded-xl border border-white/5">
                        <span>Axis X: {config.feature_config[pdpX]?.label.split('(')[0]}</span>
                        <ArrowRight size={16} className="text-brand-purple"/>
                        <span>Axis Y: {config.feature_config[pdpY]?.label.split('(')[0]}</span>
                      </div>
                    </div>
                  ) : null}
                  
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
