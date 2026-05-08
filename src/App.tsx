/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useStore } from './store/useStore';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import VisualLayer from './components/VisualLayer';
import Dashboard from './components/Dashboard';
import NoteSystem from './components/NoteSystem';
import IdeaVault from './components/IdeaVault';
import KnowledgeGraph from './components/KnowledgeGraph';
import FounderMode from './components/FounderMode';
import Analytics from './components/Analytics';
import CourseSystem from './components/CourseSystem';
import { motion, AnimatePresence } from 'motion/react';

// Remaining placeholders
const Growth = () => <div className="flex-1 p-10 ml-72"><h1 className="text-4xl font-display font-bold">Personal Growth</h1><p className="mt-4 text-zinc-500">Growth tracking protocols initializing...</p></div>;

export default function App() {
  const { user, profile, isLoading, setUser, setProfile, setIsLoading } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as any);
          }
        } catch (err) {
          console.error("Error fetching profile", err);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (profile && !profile.onboardingCompleted) {
    return <Onboarding />;
  }

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex"
        >
          {(() => {
            switch (activeTab) {
              case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
              case 'courses': return <CourseSystem />;
              case 'notes': return <NoteSystem />;
              case 'vault': return <IdeaVault />;
              case 'graph': return <KnowledgeGraph />;
              case 'entrepreneur': return <FounderMode />;
              case 'analytics': return <Analytics />;
              case 'growth': return <Growth />;
              default: return <Dashboard setActiveTab={setActiveTab} />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex bg-zinc-50 min-h-screen cursor-none">
      <VisualLayer />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
}
