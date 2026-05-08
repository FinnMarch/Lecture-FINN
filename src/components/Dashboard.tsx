import React, { useState, useEffect } from 'react';
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
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from 'recharts';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const chartData = [
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { profile } = useStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qCourses = query(collection(db, 'courses'), where('userId', '==', user.uid), limit(3));
    const unsubCourses = onSnapshot(qCourses, (snap) => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'courses'));

    const qNotes = query(collection(db, 'notes'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(8));
    const unsubNotes = onSnapshot(qNotes, (snap) => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'notes'));

    const qIdeas = query(collection(db, 'businessIdeas'), where('userId', '==', user.uid), limit(2));
    const unsubIdeas = onSnapshot(qIdeas, (snap) => {
      setIdeas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'businessIdeas'));

    return () => {
      unsubCourses();
      unsubNotes();
      unsubIdeas();
    };
  }, []);

  const productivityScore = Math.min(notes.length * 12 + courses.length * 15, 100);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex-1 p-12 ml-72 min-h-screen"
    >
      <header className="flex justify-between items-end mb-16">
        <motion.div variants={item}>
          <p className="text-[10px] font-mono font-bold tracking-[0.3em] text-zinc-400 uppercase mb-4 leading-none flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Unified Intelligence Layer
          </p>
          <h1 className="text-6xl font-display font-medium text-zinc-900 tracking-tighter leading-none">
            Systems <span className="font-serif italic font-bold">Intelligence</span>
          </h1>
        </motion.div>
        
        <motion.div variants={item} className="flex gap-4 items-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input 
              className="pl-12 pr-6 py-3 bg-white border border-zinc-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm w-72 shadow-sm font-medium"
              placeholder="Query network..."
            />
          </div>
          <button 
            onClick={() => setActiveTab('notes')}
            className="ouro-button"
          >
            <Plus className="w-4 h-4" />
            New Instance
          </button>
        </motion.div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 space-y-10">
          <motion.div 
            variants={item}
            className="p-10 glass-dark text-white rounded-[3rem] relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-[1.25rem] bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10">
                  <Sparkles className="w-5 h-5 text-zinc-100" />
                </div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-50">Neural Engine Insight</h3>
              </div>
              <p className="text-3xl font-display font-medium leading-[1.1] mb-10 tracking-tight max-w-2xl">
                {notes.length > 0 ? (
                  <>Syncing intel from <span className="text-blue-400 border-b border-blue-400/30 pb-1 font-serif italic text-3xl">{notes[0]?.topic || 'recent sessions'}</span> reveals high semantic overlap with your current growth vectors.</>
                ) : (
                  <>Initialization complete. Your <span className="text-blue-400 border-b border-blue-400/30 pb-1 font-serif italic text-3xl">Neural Layer</span> is ready to process new academic and venture protocols.</>
                )}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('graph')}
                  className="px-6 py-3 bg-white text-zinc-900 rounded-2xl text-xs font-bold transition-all active:scale-95 hover:bg-zinc-100 shadow-xl shadow-white/10"
                >
                  Graph Connection
                </button>
                <button 
                  onClick={() => setActiveTab('entrepreneur')}
                  className="px-6 py-3 bg-white/10 text-white rounded-2xl text-xs font-bold border border-white/10 backdrop-blur-md transition-all active:scale-95 hover:bg-white/20"
                >
                  Verify Strategy
                </button>
              </div>
            </div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" 
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-10">
            <motion.div variants={item} className="premium-card p-10 flex flex-col justify-between h-[300px]">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/10 mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-zinc-50 border border-zinc-100 text-green-600 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <TrendingUp className="w-3 h-3" />
                  +12.4%
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Productivity Pulse</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-7xl font-display font-medium tracking-tighter leading-none italic">{productivityScore}</span>
                  <span className="text-zinc-300 font-mono font-bold uppercase text-xs tracking-widest">/100</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={item}
              onClick={() => setActiveTab('analytics')}
              className="premium-card p-10 flex flex-col justify-between h-[300px] cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Growth Gradient</p>
                <div className="w-10 h-10 rounded-2xl border border-zinc-100 flex items-center justify-center group-hover:border-zinc-900 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                </div>
              </div>
              <div className="flex-1 -mx-10 mt-8 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.06}/>
                        <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#000" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs font-bold text-zinc-900 mt-auto">Steady evolution across {notes.length + courses.length} knowledge domains.</p>
            </motion.div>
          </div>

          <motion.div variants={item} className="premium-card p-10 h-[360px] relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-zinc-900" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-zinc-900">Knowledge Network</h3>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Semantic Mapping</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('graph')}
                className="ouro-button-secondary py-2 h-10"
              >
                Full Graph <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-3 items-center justify-center max-w-2xl mx-auto">
               {notes.length > 0 ? notes.map((note, i) => (
                  <motion.div 
                    key={note.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    onClick={() => setActiveTab('notes')}
                    className="px-6 py-2.5 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] text-xs font-bold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 cursor-pointer transition-all shadow-sm"
                  >
                    {note.topic || 'New Node'}
                  </motion.div>
               )) : ['Intelligence', 'Venture', 'Protocol'].map((tag, i) => (
                  <div key={i} className="px-6 py-2.5 bg-zinc-100 rounded-[1.25rem] text-xs font-bold text-zinc-300">
                    {tag}
                  </div>
               ))}
            </div>
          </motion.div>
        </div>

        <div className="col-span-4 space-y-10">
          <motion.div variants={item} className="premium-card p-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400">Active Protocol</h3>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="space-y-8">
              {courses.length > 0 ? courses.map((course, i) => (
                <div key={course.id} className="flex gap-6 items-start group cursor-pointer" onClick={() => setActiveTab('courses')}>
                  <div className="text-[10px] font-mono font-bold text-zinc-300 group-hover:text-zinc-900 transition-colors pt-1 italic">{(10 + i) + ':00'}</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 mb-1">{course.title}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">Studio {i + 1}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-200" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">{course.id.slice(0, 4)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-zinc-400 italic">No active academic protocols linked.</p>
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="premium-card p-10 bg-zinc-900 text-white border-none relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Idea Vault</h3>
                <Lightbulb className="w-5 h-5 text-white/40" />
              </div>
              <div className="space-y-4">
                {ideas.length > 0 ? ideas.map((idea, i) => (
                  <div 
                    key={idea.id}
                    onClick={() => setActiveTab('vault')}
                    className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <p className="text-sm font-bold text-zinc-100">{idea.title}</p>
                       <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-3 py-1 bg-white/10 text-zinc-300 rounded-full font-mono font-bold uppercase tracking-widest">B2B SaaS</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-green-400" />
                        <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest italic">Live</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-white/40 italic">Vault initialization pending.</p>
                )}
              </div>
              <button 
                onClick={() => setActiveTab('vault')}
                className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-[0.25em] hover:bg-white/10 transition-all active:scale-95"
              >
                Access Hub
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] blur-3xl rotate-45 translate-x-1/2 -translate-y-1/2" />
          </motion.div>

          <motion.div 
            variants={item}
            onClick={() => setActiveTab('growth')}
            className="p-10 border border-zinc-200 border-dashed rounded-[3rem] bg-white group hover:bg-zinc-50 transition-all cursor-pointer text-center"
          >
             <div className="w-14 h-14 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-white transition-colors">
                <Target className="w-6 h-6 text-zinc-900" />
             </div>
             <h3 className="text-lg font-display font-medium text-zinc-900 mb-2">Weekly Synthesis</h3>
             <p className="text-xs text-zinc-500 leading-relaxed font-medium px-4">
               {notes.length >= 5 ? 'Intelligence threshold reached. Synthesize your evolution.' : 'Continue processing intel to unlock weekly synthesis.'}
             </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

