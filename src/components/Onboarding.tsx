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
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Step {step + 1} of {STEPS.length}</h2>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-8 h-1 rounded-full transition-all duration-500",
                    i <= step ? "bg-zinc-900" : "bg-zinc-200"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-zinc-100">
              <Icon className="w-6 h-6 text-zinc-900" />
            </div>
            <h1 className="text-3xl font-display font-bold text-zinc-900">{currentStep.title}</h1>
          </div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="premium-card p-10 bg-white border border-zinc-200 shadow-2xl rounded-[2.5rem]"
        >
          <div className="space-y-8">
            {step === 0 && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">University Name</label>
                  <input 
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                    placeholder="e.g. Stanford University"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Major / Degree</label>
                  <input 
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                    placeholder="e.g. Business Administration"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Career Goals</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium min-h-[120px]"
                    placeholder="Where do you see yourself in 5 years?"
                    value={formData.futureCareerGoals}
                    onChange={(e) => setFormData({ ...formData, futureCareerGoals: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Preferred Industries (Comma separated)</label>
                  <input 
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                    placeholder="Fintech, AI, Green Energy..."
                    value={formData.preferredIndustries}
                    onChange={(e) => setFormData({ ...formData, preferredIndustries: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Startup Interests</label>
                  <input 
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                    placeholder="SaaS, E-commerce, Deep Tech..."
                    value={formData.startupInterests}
                    onChange={(e) => setFormData({ ...formData, startupInterests: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Interests & Hobbies</label>
                  <input 
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                    placeholder="Philosophy, Crypto, Chess..."
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-12 pt-8 border-t border-zinc-100">
            <button 
              onClick={handleBack}
              disabled={step === 0}
              className="px-6 py-3 rounded-xl text-zinc-400 font-semibold flex items-center gap-2 hover:bg-zinc-50 disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-900/10 transition-all"
            >
              {step === STEPS.length - 1 ? 'Initialize FounderOS' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
