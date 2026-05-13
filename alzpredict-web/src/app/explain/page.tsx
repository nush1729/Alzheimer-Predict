"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Loader2, Search, Network, TriangleAlert } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function ExplainLab() {
  const [config, setConfig] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [shapData, setShapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await axios.get(`${API_URL}/api/metadata`);
        setConfig(res.data);
        const def: Record<string, number> = {};
        res.data.features.forEach((f: string) => {
          def[f] = res.data.feature_config[f]?.default || 0;
        });
        setInputs(def);
      } catch (err) {
        setError("Hardware disconnected.");
      }
    }
    fetchMeta();
  }, []);

  const getExplainer = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/explain`, { data: inputs });
      setShapData(res.data);
    } catch (e) {
      setError("SHAP compute module error.");
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch on first inputs load if exist
  useEffect(() => {
    if (Object.keys(inputs).length > 0 && !shapData.length) {
      getExplainer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      <header className="mb-12">
        <h1 className="text-4xl font-display font-black bg-gradient-to-r from-white to-brand-purple bg-clip-text text-transparent">
          Explainability Laboratory
        </h1>
        <p className="text-slate-400 mt-2">Visualizing local SHAP vectors across the hyper-plane.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-2xl space-y-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold flex items-center gap-2"><Search size={18} /> Active Configuration</h3>
            </div>
            <div className="space-y-4">
              {config?.features?.map((f: string) => (
                <div key={f} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-lg">
                  <span className="text-sm text-slate-400">{config.feature_config[f]?.label.split('(')[0]}</span>
                  <span className="text-sm font-bold font-mono text-brand-cyan">{inputs[f]}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => window.location.href = '/diagnostic'}
              className="w-full py-3 glass-panel border-brand-purple/20 text-brand-purple rounded-xl hover:bg-brand-purple/10 font-bold text-sm flex items-center justify-center gap-2"
            >
              Reconfigure Parameters
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-2xl flex-1 min-h-[500px]">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-display font-bold flex items-center gap-2">
                  <Network className="text-brand-purple" size={20} /> Local Feature Contributions
                </h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold">Algorithm: TreeSHAP Algorithm (Exact)</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500 opacity-70"/> Increases Risk</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-brand-blue opacity-70"/> Decreases Risk</div>
              </div>
            </div>

            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-purple" size={32} />
              </div>
            ) : shapData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={12} />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={12} fontWeight="bold" width={80} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <ReferenceLine x={0} stroke="#64748b" strokeWidth={1.5} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {shapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? "#ef4444" : "#0A84FF"} opacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-600">
                <TriangleAlert size={40} className="mb-4 opacity-20" />
                <p>Analysis unavailable. Check dataset integrity.</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-brand-purple/5 rounded-xl border border-brand-purple/10 text-sm text-slate-400 leading-relaxed flex gap-3">
              <div className="text-brand-purple pt-0.5 font-bold">NOTE:</div>
              <div>These SHAP values represent the impact of each feature shifting the prediction logic from the dataset base rate (average) towards the result logic computed for this patient specific footprint.</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
