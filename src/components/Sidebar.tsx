import React from 'react';
import { 
  BarChart3, 
  BookMarked, 
  LayoutDashboard, 
  Lightbulb, 
  LogOut, 
  Network, 
  Plus, 
  Search, 
  Settings, 
  User, 
  Zap,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Clock
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

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
    <div className="w-72 h-screen bg-white border-r border-zinc-200 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">Founder<span className="text-zinc-400">OS</span></h1>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "nav-link w-full",
                  isActive && "nav-link-active"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-400")} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{profile?.displayName}</p>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider truncate">{profile?.major}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
