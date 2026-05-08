import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  Brain, 
  Lightbulb, 
  TrendingUp,
  Clock,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', value: 4 },
  { name: 'Tue', value: 7 },
  { name: 'Wed', value: 5 },
  { name: 'Thu', value: 9 },
  { name: 'Fri', value: 12 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 10 },
];

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { profile } = useStore();

  return (
    <div className="flex-1 p-10 ml-72">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-zinc-900 mb-2">Systems Intelligence</h1>
          <p className="text-zinc-500 font-medium tracking-tight">Welcome back, {profile?.displayName}. Your ecosystem is evolving.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              className="pl-12 pr-6 py-3 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm w-80 shadow-sm"
              placeholder="Search knowledge network..."
            />
          </div>
          <button 
            onClick={() => setActiveTab('notes')}
            className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-900/10 transition-all group"
          >
            <Plus className="w-5 h-5" />
            New Instance
            <kbd className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono group-hover:bg-white/20">⌘N</kbd>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Intelligence Cards */}
        <div className="col-span-8 grid grid-cols-2 gap-8">
          {/* AI Insights */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="col-span-2 p-8 glass-dark text-white rounded-[2.5rem] relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Neural Engine Insight</h3>
              </div>
              <p className="text-2xl font-display font-medium leading-tight mb-8">
                Your recent focus on <span className="text-white font-bold underline decoration-white/30 underline-offset-8 italic">Supply Chain Management</span> correlates with 3 new startup ideas in the Green Logistics sector.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('graph')}
                  className="px-5 py-2.5 bg-white text-zinc-900 rounded-xl text-xs font-bold transition-transform active:scale-95 hover:bg-zinc-100"
                >
                  Explore Connection
                </button>
                <button 
                  onClick={() => setActiveTab('entrepreneur')}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-transform active:scale-95 hover:bg-white/20"
                >
                  Founder Strategy
                </button>
              </div>
            </div>
            {/* Visual background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4" />
          </motion.div>

          {/* Productivity Score */}
          <div className="premium-card p-8 flex flex-col justify-between min-h-[240px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-zinc-900" />
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                +12% Trend
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Productivity Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold">94</span>
                <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">/100</span>
              </div>
            </div>
          </div>

          {/* Learning Analytics Preview */}
          <div 
            onClick={() => setActiveTab('analytics')}
            className="premium-card p-8 overflow-hidden flex flex-col min-h-[240px] cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Absorption Rate</p>
              <TrendingUp className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 -mx-8 -mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#000" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Knowledge Graph Preview */}
          <div className="col-span-2 premium-card p-8 flex flex-col h-80 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-zinc-900" />
                </div>
                <h3 className="text-lg font-display font-bold">Knowledge Network</h3>
              </div>
              <button 
                onClick={() => setActiveTab('graph')}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-all"
              >
                Full Graph <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
               <div className="flex flex-wrap gap-4 justify-center max-w-lg">
                  {['Microeconomics', 'Neural Nets', 'SaaS Ops', 'UX Psych', 'Venture Cap', 'Game Theory'].map(tag => (
                    <div 
                      key={tag} 
                      onClick={() => setActiveTab('notes')}
                      className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-xs font-medium text-zinc-600 hover:border-zinc-900 cursor-pointer transition-all"
                    >
                      {tag}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Secondary Sections */}
        <div className="col-span-4 space-y-8">
          {/* Upcoming Classes */}
          <div className="premium-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Next Protocol</h3>
              <button 
                onClick={() => setActiveTab('courses')}
                className="p-1 hover:bg-zinc-50 rounded-lg transition-all"
              >
                <Calendar className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="space-y-6">
              {[
                { time: '10:00 AM', label: 'Advanced Macroeconomics', room: 'Hall 4' },
                { time: '01:30 PM', label: 'Startup Strategy', room: 'Studio 2' },
                { time: '04:00 PM', label: 'Data Ethics', room: 'Virtual' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="text-[10px] font-bold text-zinc-400 mt-1 whitespace-nowrap">{item.time}</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-400 font-medium">{item.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Ideas Vault Preview */}
          <div className="premium-card p-8 bg-zinc-900 text-white border-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Idea Vault</h3>
              <Lightbulb className="w-4 h-4 text-white/40" />
            </div>
            <div className="space-y-4">
              <div 
                onClick={() => setActiveTab('vault')}
                className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                   <p className="text-sm font-bold">AI Logistics Optimizer</p>
                   <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md font-bold">B2B SaaS</span>
                  <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-300 rounded-md font-bold">9.2 Opportunity</span>
                </div>
              </div>
              <div 
                onClick={() => setActiveTab('vault')}
                className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                   <p className="text-sm font-bold">Fintech for Gen Z</p>
                   <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md font-bold">Fintech</span>
                  <span className="text-[10px] px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-md font-bold">8.5 Opportunity</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('vault')}
              className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
            >
              View All Ventures
            </button>
          </div>

          {/* Weekly Reflection */}
          <div 
            onClick={() => setActiveTab('growth')}
            className="premium-card p-8 border-dashed border-2 bg-transparent pointer-events-auto hover:bg-zinc-50 transition-all cursor-pointer"
          >
             <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-zinc-900" />
                <h3 className="text-sm font-bold">Weekly Reflection</h3>
             </div>
             <p className="text-xs text-zinc-500 leading-relaxed font-medium">You haven't documented your intellectual growth for this week yet. Connect the dots now.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
