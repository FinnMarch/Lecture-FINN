import React from 'react';
import { 
  BarChart3, 
  BookMarked, 
  LayoutDashboard, 
  Lightbulb, 
  LogOut, 
  Network, 
  Zap,
  TrendingUp,
  BrainCircuit,
  User,
  Settings
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Intelligence', icon: LayoutDashboard },
  { id: 'courses', label: 'Academia', icon: BookMarked },
  { id: 'notes', label: 'Knowledge', icon: BrainCircuit },
  { id: 'vault', label: 'Idea Vault', icon: Lightbulb },
  { id: 'graph', label: 'Second Brain', icon: Network },
  { id: 'entrepreneur', label: 'Founder Mode', icon: Zap },
  { id: 'analytics', label: 'Performance', icon: BarChart3 },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { profile } = useStore();

  const handleSignOut = () => auth.signOut();

  return (
    <div className="w-72 h-screen bg-zinc-50 border-r border-zinc-200/60 flex flex-col fixed left-0 top-0 z-50 overflow-hidden">
      <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-11 h-11 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-2xl shadow-zinc-900/20 group cursor-pointer overflow-hidden relative">
            <motion.div 
              animate={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-20 bg-gradient-to-tr from-white to-transparent"
            />
            <Zap className="w-6 h-6 fill-white relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-display font-medium tracking-tighter leading-none">Founder<span className="font-serif italic font-bold">OS</span></h1>
            <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase mt-1">Intelligence Layer</p>
          </div>
        </motion.div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "nav-link w-full group relative overflow-hidden",
                  isActive && "nav-link-active"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-zinc-900"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("w-4.5 h-4.5 relative z-10 transition-colors duration-300", 
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
                )} />
                <span className="font-semibold text-sm relative z-10 tracking-tight">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        <div className="bg-white border border-zinc-200/50 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200 shadow-sm">
              <User className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate leading-none mb-1 text-zinc-900">{profile?.displayName || 'Operator'}</p>
              <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-widest truncate">{profile?.major || 'Research Layer'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center p-2 rounded-xl bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center justify-center p-2 rounded-xl bg-zinc-50 text-zinc-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

