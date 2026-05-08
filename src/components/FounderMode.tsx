import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  Search, 
  Users, 
  Map, 
  Flag, 
  Layout, 
  Shield, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function FounderMode() {
  const [activeTool, setActiveTool] = useState('lean-canvas');
  const [toolData, setToolData] = useState<Record<string, any>>({
    'lean-canvas': { problem: '', solution: '', uniqueValue: '', cost: '', revenue: '' },
    'swot': { strengths: '', weaknesses: '', opportunities: '', threats: '' },
    'competitors': { direct: '', indirect: '', advantage: '' },
    'roadmap': { q1: '', q2: '', q3: '', q4: '' },
    'pitch': { hook: '', model: '', ask: '' }
  });

  const handleDataChange = (field: string, value: string) => {
    setToolData(prev => ({
      ...prev,
      [activeTool]: {
        ...prev[activeTool],
        [field]: value
      }
    }));
  };

  const renderToolEditor = () => {
    const data = toolData[activeTool];
    switch (activeTool) {
      case 'lean-canvas':
        return (
          <div className="flex-1 grid grid-cols-3 gap-6 p-1 bg-zinc-50 rounded-2xl border border-zinc-200/50">
            <div className="bg-white rounded-xl p-6 border border-zinc-200/40 shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Problem</h4>
                <Info className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <textarea 
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none" 
                placeholder="Top 3 problems you're solving..." 
                value={data.problem}
                onChange={(e) => handleDataChange('problem', e.target.value)}
              />
            </div>
            <div className="bg-white rounded-xl p-6 border border-zinc-200/40 shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Solution</h4>
                <Sparkles className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <textarea 
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none" 
                placeholder="How do you fix it?" 
                value={data.solution}
                onChange={(e) => handleDataChange('solution', e.target.value)}
              />
            </div>
            <div className="bg-white rounded-xl p-6 border border-zinc-200/40 shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Unique Value</h4>
                <Zap className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <textarea 
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none" 
                placeholder="Why you? Why now?" 
                value={data.uniqueValue}
                onChange={(e) => handleDataChange('uniqueValue', e.target.value)}
              />
            </div>
            <div className="col-span-3 h-px bg-zinc-200/50 mx-6" />
            <div className="bg-white rounded-xl p-6 border border-zinc-200/40 shadow-sm flex flex-col group h-40">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cost Structure</h4>
              </div>
              <textarea 
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none" 
                placeholder="Server costs, marketing, hiring..." 
                value={data.cost}
                onChange={(e) => handleDataChange('cost', e.target.value)}
              />
            </div>
            <div className="col-span-2 bg-white rounded-xl p-6 border border-zinc-200/40 shadow-sm flex flex-col group h-40">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Revenue Streams</h4>
              </div>
              <textarea 
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none" 
                placeholder="SaaS, Tx fees, Advertising..." 
                value={data.revenue}
                onChange={(e) => handleDataChange('revenue', e.target.value)}
              />
            </div>
          </div>
        );
      case 'swot':
        return (
          <div className="grid grid-cols-2 gap-6 p-6 h-full">
            {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map(type => (
              <div key={type} className="bg-white rounded-xl p-6 border border-zinc-200/40 shadow-sm flex flex-col">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">{type}</h4>
                <textarea 
                  className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none"
                  placeholder={`Identify ${type.toLowerCase()}...`}
                  value={data[type.toLowerCase()]}
                  onChange={(e) => handleDataChange(type.toLowerCase(), e.target.value)}
                />
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <Zap className="w-12 h-12 text-zinc-200 mb-6" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">Protocol: {activeTool.toUpperCase()}</h3>
            <p className="text-sm text-zinc-300 max-w-sm">Founder Engine is currently optimizing this module. Intellectual capture remains enabled.</p>
            <textarea 
              className="mt-10 w-full max-w-lg h-64 p-6 bg-white border border-zinc-200 rounded-2xl focus:outline-none font-mono text-sm shadow-sm"
              placeholder="Dump observations here..."
            />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 ml-72 p-10 bg-zinc-50 font-sans min-h-screen">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-xl shadow-zinc-900/20">
            <Zap className="w-7 h-7 fill-white" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-zinc-900 mb-1">Founder Mode</h1>
            <p className="text-zinc-500 font-medium tracking-tight">Active mission control for your venture development.</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
          Status: Operational
        </div>
      </header>

      <div className="flex gap-8 mb-12 overflow-x-auto no-scrollbar pb-4">
        {[
          { id: 'lean-canvas', label: 'Lean Canvas', icon: Layout },
          { id: 'swot', label: 'SWOT Analysis', icon: Shield },
          { id: 'competitors', label: 'Market Intel', icon: Search },
          { id: 'roadmap', label: 'Growth Plan', icon: Map },
          { id: 'pitch', label: 'Investor Deck', icon: Flag },
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all whitespace-nowrap",
                isActive 
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/10 scale-105" 
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-400")} />
              <span className="text-sm font-bold">{tool.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-9">
          <div className="premium-card p-10 bg-white min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-display font-bold text-zinc-900 capitalize">{activeTool.replace('-', ' ')}</h2>
              <div className="flex gap-3">
                 <button className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-50 transition-all flex items-center gap-2">
                   <Users className="w-4 h-4" /> Share with Team
                 </button>
                 <button className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-md">
                   Export Strategy <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {renderToolEditor()}
          </div>
        </div>

        <div className="col-span-3 space-y-8">
           <div className="premium-card p-8 bg-zinc-900 text-white border-none">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Neural Insights</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-medium leading-relaxed opacity-80">
                      Market data suggests a 42% growth in interest for B2B sustainability SaaS this quarter. Consider positioning your "Eco Logistics" solution towards Mid-market firms first.
                    </p>
                 </div>
                 <button className="w-full py-3 bg-white text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-all">Generate Validation Report</button>
              </div>
           </div>

           <div className="premium-card p-8 text-center border-dashed border-2 bg-zinc-50/50">
              <Users className="w-8 h-8 text-zinc-300 mx-auto mb-4" />
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Mentor Network</h4>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mb-6">
                Connect with industry experts who have built similar systems. Unlock after 10 validated notes.
              </p>
              <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-zinc-900 transition-all duration-1000" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
