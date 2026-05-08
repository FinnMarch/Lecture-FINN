import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Lightbulb, 
  ArrowUpRight, 
  Zap, 
  Target, 
  TrendingUp, 
  Layers, 
  X,
  Sparkles,
  BarChart3,
  Trash2
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { generateAIJSON } from '../lib/gemini';
import { Type } from '@google/genai';
import { cn } from '../lib/utils';

export default function IdeaVault() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    market: '',
    solution: '',
    revenueModel: '',
    difficultyScore: 5,
    opportunityScore: 7,
    industry: '',
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'businessIdeas'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'businessIdeas'));

    return () => unsubscribe();
  }, []);

    const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'businessIdeas'), {
        title: formData.title,
        problem: formData.problem,
        market: formData.market,
        solution: formData.solution,
        revenueModel: formData.revenueModel,
        difficultyScore: formData.difficultyScore,
        opportunityScore: formData.opportunityScore,
        industry: formData.industry,
        userId: user?.uid,
        createdAt: new Date().toISOString(),
      });
      setShowNewModal(false);
      setFormData({
        title: '', problem: '', market: '', solution: '', revenueModel: '', 
        difficultyScore: 5, opportunityScore: 7, industry: ''
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'businessIdeas');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Redact this venture idea from the vault?')) return;
    try {
      await deleteDoc(doc(db, 'businessIdeas', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `businessIdeas/${id}`);
    }
  };

  const handleAIMentor = async () => {
    if (!formData.title && !formData.problem) return;
    setIsGenerating(true);
    try {
      const schema = {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          market: { type: Type.STRING },
          solution: { type: Type.STRING },
          revenueModel: { type: Type.STRING },
          opportunityScore: { type: Type.NUMBER },
          industry: { type: Type.STRING },
        }
      };
      
      const prompt = `Based on this startup idea title: "${formData.title}" and brief problem: "${formData.problem}", suggest a complete business model framework.`;
      const result = await generateAIJSON(prompt, schema, "You are a Silicon Valley startup mentor.");
      
      setFormData(prev => ({ ...prev, ...result }));
    } catch (err) {
      console.error("AI Mentor error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 ml-72 p-10 bg-zinc-50 font-sans min-h-screen">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display font-medium text-zinc-900 mb-2 tracking-tighter">Venture <span className="font-serif italic font-bold">Vault</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">Incubating intellectual leverage into market dominance.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-900/10 transition-all"
        >
          <Plus className="w-5 h-5" />
          Capture Idea
        </button>
      </header>

      <div className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-3 premium-card p-6 bg-zinc-900 text-white border-none">
          <Layers className="w-6 h-6 mb-4 text-white/40" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Active Clusters</p>
          <p className="text-2xl font-display font-bold">{ideas.length} Ventures</p>
        </div>
        <div className="col-span-3 premium-card p-6">
          <Target className="w-6 h-6 mb-4 text-zinc-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Avg. Opportunity</p>
          <p className="text-2xl font-display font-bold">8.4 / 10</p>
        </div>
        <div className="col-span-3 premium-card p-6">
          <Zap className="w-6 h-6 mb-4 text-zinc-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Industry Spread</p>
          <p className="text-2xl font-display font-bold">4 Sectors</p>
        </div>
        <div className="col-span-3 premium-card p-6">
          <BarChart3 className="w-6 h-6 mb-4 text-zinc-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Growth Forecast</p>
          <p className="text-2xl font-display font-bold">Exponential</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <AnimatePresence>
          {ideas.map((idea, index) => (
            <motion.div
              layout
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="premium-card p-8 bg-white hover:bg-zinc-900 hover:text-white group relative cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 bg-zinc-100 group-hover:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {idea.industry || 'General'}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleDelete(idea.id, e)}
                    className="p-4 -m-2 text-zinc-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ArrowUpRight className="w-5 h-5 text-zinc-300 group-hover:text-white/50" />
                </div>
              </div>
              <h3 className="text-xl font-display font-bold mb-4 tracking-tight">{idea.title}</h3>
              <p className="text-xs text-zinc-500 group-hover:text-zinc-400 leading-relaxed font-medium line-clamp-3 mb-8 italic">
                "{idea.problem}"
              </p>
              
              <div className="flex justify-between items-center pt-6 border-t border-zinc-100 group-hover:border-white/10">
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white group-hover:border-zinc-900 group-hover:bg-white/10 flex items-center justify-center">
                     <Target className="w-3 h-3" />
                   </div>
                   <div className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white group-hover:border-zinc-900 group-hover:bg-white/10 flex items-center justify-center">
                     <Zap className="w-3 h-3" />
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Opp Score</p>
                  <p className="text-sm font-bold text-blue-500">{idea.opportunityScore}/10</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Idea Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <header className="p-8 border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">Ideation Protocol</h2>
                </div>
                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </header>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                 <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Venture Title</label>
                      <input 
                        className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                        placeholder="e.g. EcoBox Logistics"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleAIMentor}
                      disabled={isGenerating}
                      className="mt-6 px-4 py-2 h-[48px] bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 hover:border-zinc-900 transition-all flex items-center gap-2 group"
                    >
                      <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                      {isGenerating ? "Consulting..." : "AI Mentor"}
                    </button>
                 </div>

                 <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">The Core Problem</label>
                  <textarea 
                    className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all font-medium min-h-[80px]"
                    placeholder="Identify the market friction..."
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Proposed Solution</label>
                    <textarea 
                      className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all font-medium min-h-[100px]"
                      placeholder="Your unique leverage..."
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Market Segment</label>
                    <textarea 
                      className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all font-medium min-h-[100px]"
                      placeholder="Who pays for this?"
                      value={formData.market}
                      onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Revenue Model</label>
                    <input 
                      className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                      placeholder="e.g. SaaS Subscription"
                      value={formData.revenueModel}
                      onChange={(e) => setFormData({ ...formData, revenueModel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Industry Sector</label>
                    <input 
                      className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                      placeholder="e.g. Sustainability"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                </div>
              </form>

              <footer className="p-8 border-t border-zinc-100 flex justify-end gap-4">
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="px-6 py-3 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl"
                >
                  Confirm Entry
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
