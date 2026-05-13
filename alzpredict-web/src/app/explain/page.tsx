"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Loader2, Search, Network, GitBranch, Compass, Info, ArrowRight, RefreshCcw, ChevronsRight } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function ExplainLab() {
  const [activeTab, setActiveTab] = useState<"shap" | "recourse" | "pdp">("shap");
  const [config, setConfig] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [shapData, setShapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Recourse states
  const [recourse, setRecourse] = useState<any>(null);
  const [recourseLoading, setRecourseLoading] = useState(false);

  // PDP States
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

  // Load shap & recourse on mount once inputs exist
  useEffect(() => {
    if (Object.keys(inputs).length > 0) {
      fetchShap();
      fetchRecourse();
      fetchPdp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  // Refetch PDP if features change
  useEffect(() => {
    if (Object.keys(inputs).length > 0) {
      fetchPdp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdpX, pdpY]);

  if (!config) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center z-10 relative">
        <Loader2 className="animate-spin text-brand-purple" size={44} />
        <p className="text-slate-400 font-display text-xs tracking-widest uppercase mt-4">Establishing Explainability Framework...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 relative z-10">
      
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-display font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Explainability Laboratory
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Deconstruct high-dimensional ML manifolds into clinical, human-auditable mechanics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Config Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl relative border border-white/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-transparent" />
            <h3 className="font-display font-bold flex items-center gap-2 text-slate-200 mb-6">
              <Search size={16} className="text-brand-purple" /> Evaluated Phenotype
            </h3>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {config.features.map((f: string) => (
                <div key={f} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/5 transition-all duration-300">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{config.feature_config[f]?.label.split('(')[0]}</span>
                  <span className="text-xs font-mono font-black text-brand-cyan">{inputs[f]?.toFixed(config.feature_config[f]?.step < 1 ? 2 : 0)}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => window.location.href = '/diagnostic'}
              className="mt-6 w-full py-3.5 rounded-xl text-xs font-black tracking-widest uppercase bg-brand-purple/10 border border-brand-purple/30 text-brand-purple hover:bg-brand-purple hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              Reconfigure Biosignature <RefreshCcw size={13}/>
            </button>
          </div>
        </div>

        {/* Right: Interactive Multi-Tab Analysis Suite */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Nav Tabs */}
          <div className="flex gap-2 glass-panel p-1.5 rounded-xl border border-white/5 bg-black/20 self-start">
            {[
              { id: "shap", label: "SHAP Vectors", icon: <Network size={14}/> },
              { id: "recourse", label: "Counterfactual Recourse", icon: <GitBranch size={14}/> },
              { id: "pdp", label: "Interaction Mesh (PDP)", icon: <Compass size={14}/> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                  activeTab === t.id 
                    ? "bg-white/10 text-white border border-white/5 shadow-inner" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Dynamic Workspace Port */}
          <div className="glass-panel p-8 rounded-2xl flex-1 min-h-[450px] relative border border-white/5 flex flex-col overflow-hidden">
            
            <AnimatePresence mode="wait">
              
              {/* SHAP VIEW */}
              {activeTab === "shap" && (
                <motion.div
                  key="shap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col flex-1"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-lg font-display font-bold text-white">TreeSHAP Local Topology</h3>
                      <p className="text-xs text-slate-500 tracking-wide font-bold mt-0.5 uppercase">Attribution geometry relative to Expected Base Value</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[10px] uppercase font-black tracking-wider">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-500 opacity-80" /> Accelerates Risk</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-brand-blue opacity-80" /> Dampens Risk</div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-purple" size={32}/></div>
                  ) : shapData.length > 0 ? (
                    <div className="flex-1 min-h-[320px] w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                          <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => v.toFixed(2)} />
                          <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.6)" fontSize={10} fontWeight="bold" width={65} axisLine={false} />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '11px' }}
                          />
                          <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                            {shapData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.value > 0 ? "#ef4444" : "#0A84FF"} opacity={0.8} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                  
                  <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-slate-400 leading-relaxed flex gap-3">
                    <Info size={14} className="text-brand-purple shrink-0 pt-0.5" />
                    <span>Values represents localized impact vector forcing the classification boundary. Sum of feature attributions exactly equals output logit minus expected mean base value.</span>
                  </div>
                </motion.div>
              )}

              {/* RECOURSE VIEW */}
              {activeTab === "recourse" && (
                <motion.div
                  key="recourse"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col flex-1"
                >
                  <div className="mb-8">
                    <h3 className="text-lg font-display font-bold text-white">Algorithmic Counterfactual Recourse</h3>
                    <p className="text-xs text-slate-500 tracking-wide font-bold mt-0.5 uppercase">Minimal multidimensional vector delta to yield low-risk classification</p>
                  </div>

                  {recourseLoading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-cyan" size={32}/></div>
                  ) : recourse ? (
                    <div className="flex-1 flex flex-col justify-center gap-8 py-4 relative z-10">
                      
                      <div className="p-5 rounded-2xl border border-white/5 bg-black/30">
                        <p className="text-sm leading-relaxed font-light text-slate-300 italic">&quot;{recourse.message}&quot;</p>
                      </div>

                      {recourse.changes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recourse.changes.map((ch: any, i: number) => (
                            <div key={i} className="glass-panel p-5 rounded-xl relative overflow-hidden border border-brand-cyan/20">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black tracking-widest uppercase text-brand-cyan">{ch.feature} Adjustment</span>
                                <GitBranch size={14} className="text-brand-cyan opacity-50" />
                              </div>
                              <div className="flex items-center justify-between text-center bg-black/20 rounded-lg p-4 border border-white/5 mt-4">
                                <div className="flex-1">
                                  <div className="text-[9px] font-bold uppercase text-slate-500">Current</div>
                                  <div className="text-xl font-black font-mono text-slate-400">{ch.original.toFixed(ch.original < 2 ? 2 : 0)}</div>
                                </div>
                                <ChevronsRight className="text-brand-cyan shrink-0" size={18} />
                                <div className="flex-1">
                                  <div className="text-[9px] font-bold uppercase text-emerald-400">Target</div>
                                  <div className="text-xl font-black font-mono text-emerald-400">{ch.target.toFixed(ch.target < 2 ? 2 : 0)}</div>
                                </div>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-4 text-center font-bold">Action: {ch.description}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-widest">
                          Baseline holds nominal certification limits
                        </div>
                      )}
                      
                    </div>
                  ) : null}
                </motion.div>
              )}

              {/* PDP VIEW */}
              {activeTab === "pdp" && (
                <motion.div
                  key="pdp"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col flex-1"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div>
                      <h3 className="text-lg font-display font-bold text-white">Partial Dependence Topology</h3>
                      <p className="text-xs text-slate-500 tracking-wide font-bold mt-0.5 uppercase">Non-linear joint probability distribution surface mesh</p>
                    </div>
                    
                    {/* Feature Axes Selectors */}
                    <div className="flex items-center gap-3 z-20">
                      <select 
                        value={pdpX} 
                        onChange={(e) => setPdpX(e.target.value)} 
                        className="bg-[#0f172a] text-slate-300 text-[11px] font-black uppercase border border-white/10 rounded px-3 py-1.5 focus:outline-none focus:border-brand-purple"
                      >
                        {config.features.map((f: string) => <option key={f} value={f}>X: {f}</option>)}
                      </select>
                      <select 
                        value={pdpY} 
                        onChange={(e) => setPdpY(e.target.value)}
                        className="bg-[#0f172a] text-slate-300 text-[11px] font-black uppercase border border-white/10 rounded px-3 py-1.5 focus:outline-none focus:border-brand-purple"
                      >
                        {config.features.map((f: string) => <option key={f} value={f}>Y: {f}</option>)}
                      </select>
                    </div>
                  </div>

                  {pdpLoading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-purple" size={32}/></div>
                  ) : pdpData ? (
                    <div className="flex-1 flex flex-col relative z-10">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 font-bold">
                        <span className="uppercase flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Minimal Risk</span>
                        <span className="uppercase flex items-center gap-1.5">Critical Boundary <div className="w-2 h-2 rounded-full bg-red-500" /></span>
                      </div>

                      {/* Dynamic 15x15 Matrix Heatmap rendered natively for raw tech feel */}
                      <div className="w-full aspect-video max-h-[280px] border border-white/10 rounded-xl overflow-hidden bg-black grid grid-cols-15 border-collapse">
                        {pdpData.grid.map((cell: any, idx: number) => {
                          // Maps risk (0 to 1) to HSL gradient from Emerald to Red
                          // 140 deg (emerald) -> 0 deg (red)
                          const hue = 140 - cell.risk * 140;
                          const light = 25 + cell.risk * 20;
                          return (
                            <div 
                              key={idx}
                              style={{ backgroundColor: `hsla(${hue}, 90%, ${light}%, ${0.1 + cell.risk * 0.8})` }}
                              className="w-full h-full transition-all duration-300 border-[0.5px] border-black/20 hover:scale-110 hover:z-10 cursor-pointer group/cell relative"
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-[9px] font-mono text-slate-200 px-2 py-1 rounded hidden group-hover/cell:block z-30 whitespace-nowrap pointer-events-none border border-slate-700">
                                P(Risk): {(cell.risk*100).toFixed(1)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-6 text-center flex items-center justify-center gap-4 text-xs font-display font-bold text-slate-500">
                        <span>Axis X: {config.feature_config[pdpX]?.label}</span>
                        <ArrowRight size={12}/>
                        <span>Axis Y: {config.feature_config[pdpY]?.label}</span>
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
