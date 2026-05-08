import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Rocket, 
  Building2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

const STEPS = [
  { 
    id: 'academic', 
    title: 'Academic Foundation', 
    icon: GraduationCap,
    fields: ['university', 'major'] 
  },
  { 
    id: 'career', 
    title: 'Future Vision', 
    icon: Target,
    fields: ['futureCareerGoals', 'preferredIndustries'] 
  },
  { 
    id: 'startup', 
    title: 'Founder Intent', 
    icon: Rocket,
    fields: ['startupInterests', 'interests'] 
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    university: '',
    major: '',
    futureCareerGoals: '',
    preferredIndustries: '',
    startupInterests: '',
    interests: ''
  });
  const { setProfile } = useStore();

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const profileData = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || user.email?.split('@')[0] || 'Founder',
      university: formData.university,
      major: formData.major,
      futureCareerGoals: formData.futureCareerGoals,
      preferredIndustries: formData.preferredIndustries.split(',').map(s => s.trim()),
      startupInterests: formData.startupInterests.split(',').map(s => s.trim()),
      interests: formData.interests.split(',').map(s => s.trim()),
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profileData);
      setProfile(profileData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-zinc-400">Step {step + 1} // {STEPS.length}</p>
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-12 h-1 rounded-full transition-all duration-700",
                    i <= step ? "bg-zinc-900" : "bg-zinc-200"
                  )}
                />
              ))}
            </div>
          </div>
          <motion.div 
            key={currentStep.id + "-title"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-2xl flex items-center justify-center border border-zinc-100/50">
              <Icon className="w-8 h-8 text-zinc-900" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-medium text-zinc-900 tracking-tighter leading-tight italic font-serif group-hover:not-italic transition-all">{currentStep.title}</h1>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">Initialization Phase</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass p-10 border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem]"
        >
          <div className="space-y-10">
            {step === 0 && (
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 ml-1 group-focus-within:text-zinc-900 transition-colors">University Name</label>
                  <input 
                    className="ouro-input"
                    placeholder="e.g. STANFORD UNIVERSITY"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 ml-1 group-focus-within:text-zinc-900 transition-colors">Major / Degree</label>
                  <input 
                    className="ouro-input"
                    placeholder="e.g. BUSINESS ADMINISTRATION"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 ml-1 group-focus-within:text-zinc-900 transition-colors">Career Goals</label>
                  <textarea 
                    className="ouro-input min-h-[140px] resize-none"
                    placeholder="Where do you see yourself in 5 years?"
                    value={formData.futureCareerGoals}
                    onChange={(e) => setFormData({ ...formData, futureCareerGoals: e.target.value })}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 ml-1 group-focus-within:text-zinc-900 transition-colors">Preferred Industries</label>
                  <input 
                    className="ouro-input"
                    placeholder="FINTECH, AI, GREEN ENERGY..."
                    value={formData.preferredIndustries}
                    onChange={(e) => setFormData({ ...formData, preferredIndustries: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 ml-1 group-focus-within:text-zinc-900 transition-colors">Startup Interests</label>
                  <input 
                    className="ouro-input"
                    placeholder="SAAS, E-COMMERCE, DEEP TECH..."
                    value={formData.startupInterests}
                    onChange={(e) => setFormData({ ...formData, startupInterests: e.target.value })}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 ml-1 group-focus-within:text-zinc-900 transition-colors">Interests & Hobbies</label>
                  <input 
                    className="ouro-input"
                    placeholder="PHILOSOPHY, CRYPTO, CHESS..."
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-12 pt-10 border-t border-zinc-100/50">
            <button 
              onClick={handleBack}
              disabled={step === 0}
              className="px-8 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-3 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Prev Phase
            </button>
            <button 
              onClick={handleNext}
              className="ouro-button h-14 px-10 text-[10px] tracking-[0.2em]"
            >
              {step === STEPS.length - 1 ? 'INITIALIZE FOUNDEROS' : 'NEXT PHASE'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );

}
