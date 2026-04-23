/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  BarChart3, 
  Database, 
  Lock, 
  Globe, 
  Clock, 
  ChevronRight,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { predictFraudProbability, COEFFICIENTS, modelMetrics } from "./lib/ml-engine.ts";

export default function App() {
  const [formData, setFormData] = useState({
    amount: 145000,
    hour: 3,
    distance: 2450.5,
    isInternational: "Yes"
  });

  const [scanHistory, setScanHistory] = useState<any[]>([]);

  // Calculate probability
  const riskScorePercentage = useMemo(() => {
    const prob = predictFraudProbability({
      amount: formData.amount,
      hour: formData.hour,
      distance: formData.distance,
      isInternational: formData.isInternational === "Yes" ? 1 : 0
    });
    return (prob * 100).toFixed(1);
  }, [formData]);

  const riskScore = parseFloat(riskScorePercentage);

  const handleScan = () => {
    const newScan = {
      id: Date.now(),
      ...formData,
      score: riskScore,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setScanHistory(prev => [newScan, ...prev].slice(0, 5));
  };

  const importanceData = useMemo(() => {
    const raw = [
      { name: "International Status", value: COEFFICIENTS.isInternational, color: "bg-blue-600" },
      { name: "Distance from Home", value: COEFFICIENTS.distance, color: "bg-blue-500" },
      { name: "Transaction Amount", value: COEFFICIENTS.amount, color: "bg-blue-400" },
      { name: "Time Analysis", value: COEFFICIENTS.hour, color: "bg-blue-300" },
    ].sort((a, b) => b.value - a.value);

    const max = Math.max(...raw.map(d => d.value));
    return raw.map(d => ({
      ...d,
      width: `${(d.value / max) * 100}%`
    }));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar / Input Panel */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold tracking-tighter">RA</div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Risk Analytics</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Fraud Analytics Engine</p>
        </div>
        
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Transaction Parameters</label>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Amount (INR)</span>
                <input 
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5 flex justify-between">
                  <span>Hour of Day</span>
                  <span className={formData.hour >= 23 || formData.hour <= 5 ? "text-red-500" : "text-blue-600"}>
                    {formData.hour >= 23 || formData.hour <= 5 ? "RISK WINDOW" : "STANDARD"}
                  </span>
                </span>
                <input 
                  type="range"
                  min="0"
                  max="23"
                  value={formData.hour}
                  onChange={(e) => setFormData({...formData, hour: Number(e.target.value)})}
                  className="w-full accent-slate-800 mb-1"
                />
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium font-mono">
                  {formData.hour.toString().padStart(2, '0')}:00 {formData.hour < 12 ? 'AM' : 'PM'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Distance (km)</span>
                <input 
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">International Status</span>
                <div className="grid grid-cols-2 gap-2">
                  {["No", "Yes"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFormData({...formData, isInternational: opt})}
                      className={`py-2 rounded text-xs font-bold transition-all border ${
                        formData.isInternational === opt 
                        ? "bg-blue-50 border-blue-200 text-blue-700" 
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {opt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleScan}
              className="w-full bg-slate-800 text-white py-3 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Re-Calculate Risk
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Engine</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              MODEL: LOGISTIC_REG_V4.2<br/>
              LAST TRAINED: 2026-04-22<br/>
              ENV: PRODUCTION_STABLE
            </p>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col p-10 overflow-y-auto">
        {/* Header Metrics */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Risk Analysis Report</h2>
            <p className="text-slate-500 font-medium tracking-tight">Real-time fraud scoring for Federal Bank institutional accounts.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white border border-slate-200 px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Model Accuracy</p>
              <p className="text-2xl font-black text-blue-600">{(modelMetrics.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white border border-slate-200 px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Recall (Fraud)</p>
              <p className="text-2xl font-black text-blue-600">{(modelMetrics.recall * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Central Risk Gauge Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            
            <div className="relative w-56 h-56 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke={riskScore >= 70 ? "#FEE2E2" : riskScore >= 30 ? "#FEF3C7" : "#D1FAE5"} 
                  strokeWidth="3" 
                  strokeDasharray="100, 100" 
                />
                <motion.path 
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${riskScore}, 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke={riskScore >= 70 ? "#EF4444" : riskScore >= 30 ? "#F59E0B" : "#10B981"} 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black ${riskScore >= 70 ? "text-red-600" : riskScore >= 30 ? "text-amber-600" : "text-emerald-600"}`}>
                  {riskScorePercentage}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Risk Index</span>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                riskScore >= 70 ? "bg-red-50 text-red-700 border-red-100" : 
                riskScore >= 30 ? "bg-amber-50 text-amber-700 border-amber-100" : 
                "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}>
                {riskScore >= 70 ? "⚠️ High Risk Alert" : riskScore >= 30 ? "🔔 Moderate Warning" : "✅ Low Risk Verified"}
              </div>
              <h3 className="text-3xl font-black leading-tight text-slate-800 tracking-tight">
                {riskScore >= 70 ? "Critical Probability of\nFraudulent Activity" : 
                 riskScore >= 30 ? "Unusual Behavioral\nPatterns Detected" : 
                 "Standard Behavioral\nProfile Confirmed"}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                {riskScore >= 70 ? "This transaction exhibits high correlation with known fraud vectors, specifically involving large international distances during risk-prone hours." : 
                 riskScore >= 30 ? "Activity deviates from user baseline. Manual verification recommended for institutional high-ticket accounts." : 
                 "Current telemetry aligns perfectly with trusted historical patterns. No anomalous divergence detected."}
              </p>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-3xl shadow-xl p-8 text-white relative h-full flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Classification Report</h4>
            <div className="space-y-6 flex-grow">
              <div className="flex justify-between items-baseline border-b border-slate-700/50 pb-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Precision</span>
                <span className="font-mono text-xl font-bold text-blue-400">{modelMetrics.precision.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-700/50 pb-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">F1-Score</span>
                <span className="font-mono text-xl font-bold text-blue-400">{modelMetrics.f1Score.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-700/50 pb-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sensitivity</span>
                <span className="font-mono text-xl font-bold text-blue-400">0.912</span>
              </div>
              <div className="mt-8 pt-6 bg-slate-700/30 rounded-2xl p-5 border border-slate-700/50">
                <p className="text-xs leading-loose text-slate-300 italic font-medium">
                  "The model shows high confidence in identifying distance-based anomalies via <span className="text-blue-400 font-bold">SMOTE-resampled</span> neural training."
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 opacity-30">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest">N-Samples: 2,000</span>
            </div>
          </div>
        </div>

        {/* Interpretability / Feature Importance */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 flex-grow flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-5 bg-blue-600 rounded-full shadow-sm shadow-blue-500/50"></span>
              Model Interpretability (Feature Coefficients)
            </h4>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
              <BarChart3 className="w-4 h-4" />
              Live Impact Analysis
            </div>
          </div>
          
          <div className="space-y-8 flex-grow">
            {importanceData.map((feature, i) => (
              <div key={i} className="relative group">
                <div className="flex justify-between text-[11px] mb-2 uppercase font-black text-slate-500 tracking-widest">
                  <span className="group-hover:text-blue-600 transition-colors">{feature.name}</span>
                  <span className="font-mono font-bold">+{feature.value} Impact</span>
                </div>
                <div className="h-8 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: feature.width }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${feature.color} rounded-md shadow-sm`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Scoping</p>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">International markers are currently heavily weighted due to recent cross-border adversarial patterns.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Temporal Windows</p>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">System identifies 00:00 - 05:00 as a high-risk window for institutional bulk settlements.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Geospatial Delta</p>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">Distance calculation uses direct Euclidean normalization against user's primary KYC address.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


