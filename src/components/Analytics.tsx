import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Activity, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  CircleDot,
  ArrowUpRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

const retentionData = [
  { name: 'W1', value: 400 },
  { name: 'W2', value: 300 },
  { name: 'W3', value: 600 },
  { name: 'W4', value: 800 },
  { name: 'W5', value: 500 },
  { name: 'W6', value: 900 },
  { name: 'W7', value: 1100 },
];

const subjectData = [
  { name: 'Economics', value: 35 },
  { name: 'Strategy', value: 25 },
  { name: 'Finance', value: 20 },
  { name: 'Marketing', value: 20 },
];

const COLORS = ['#000000', '#3f3f46', '#71717a', '#a1a1aa'];

export default function Analytics() {
  return (
    <div className="flex-1 ml-72 p-10 bg-zinc-50 font-sans min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl font-display font-bold text-zinc-900 mb-2">Systems Performance</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Real-time quantification of your intellectual and entrepreneurial velocity.</p>
      </header>

      <div className="grid grid-cols-4 gap-8 mb-12">
         {[
           { label: 'Study Volume', value: '42.5 hrs', trend: '+15%', icon: Clock },
           { label: 'Note Density', value: '184 entries', trend: '+8%', icon: BookOpen },
           { label: 'Retention Rate', value: '88%', trend: '+3%', icon: BrainCircuit },
           { label: 'Idea Velocity', value: '4.2/wk', trend: '+22%', icon: Zap },
         ].map((stat, i) => {
           const Icon = stat.icon;
           return (
             <div key={i} className="premium-card p-6 border-none shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-zinc-900" />
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.trend}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-zinc-900">{stat.value}</p>
                </div>
             </div>
           )
         })}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Retention Trend */}
        <div className="col-span-8 premium-card p-10 bg-white min-h-[400px] flex flex-col">
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-lg font-display font-bold text-zinc-900">Intellectual Accumulation</h3>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mt-1">Concept Retention Over Time</p>
              </div>
              <Activity className="w-5 h-5 text-zinc-300" />
           </div>
           <div className="flex-1 -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f8f8f8' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#000" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Subject Diversity */}
        <div className="col-span-4 premium-card p-10 bg-white flex flex-col h-full">
           <h3 className="text-lg font-display font-bold text-zinc-900 mb-8">Subject Topology</h3>
           <div className="flex-1 relative min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-3 mt-6">
              {subjectData.map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs font-bold text-zinc-900">{entry.name}</span>
                   </div>
                   <span className="text-xs font-bold text-zinc-400">{entry.value}%</span>
                </div>
              ))}
           </div>
        </div>

        {/* Learning Consistency Heatmap (Visual Mockup) */}
        <div className="col-span-12 premium-card p-10 bg-white h-72">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-display font-bold text-zinc-900">Consistency Matrix</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Last 12 Working Weeks</p>
           </div>
           <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-2 h-full">
              {Array.from({ length: 84 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "rounded-[4px] aspect-square transition-all cursor-pointer hover:ring-2 hover:ring-zinc-900 ring-offset-2",
                    i % 7 === 0 ? "bg-zinc-50" : 
                    i % 3 === 0 ? "bg-zinc-900" : 
                    i % 2 === 0 ? "bg-zinc-400" : "bg-zinc-200"
                  )}
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
