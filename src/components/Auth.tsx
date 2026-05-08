import React, { useState } from 'react';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, User as UserIcon, Chrome, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const formatError = (message: string) => {
    if (message.includes('auth/unauthorized-domain')) {
      return 'Unauthorized Domain: Please add this URL to your Firebase Console > Authentication > Settings > Authorized domains.';
    }
    if (message.includes('auth/invalid-credential')) return 'Invalid email or password.';
    if (message.includes('auth/user-not-found')) return 'No account found with this email.';
    if (message.includes('auth/wrong-password')) return 'Incorrect password.';
    if (message.includes('auth/email-already-in-use')) return 'An account already exists with this email.';
    if (message.includes('auth/weak-password')) return 'Password should be at least 6 characters.';
    if (message.includes('auth/popup-closed-by-user')) return 'Sign-in cancelled.';
    return message.replace('Firebase: ', '').replace(/Error \((auth\/.*?)\): /, '');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(formatError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(formatError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/20 blur-[150px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-zinc-900 text-white mb-8 shadow-2xl shadow-zinc-900/40 relative overflow-hidden group"
          >
            <Sparkles className="w-10 h-10 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <h1 className="text-5xl font-display font-medium tracking-tighter text-zinc-900 mb-4 leading-none">
            Founder<span className="font-serif italic font-bold">OS</span>
          </h1>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-zinc-400">Intelligence for Ambition</p>
        </div>

        <div className="glass p-10 border border-white/50 shadow-2xl shadow-zinc-900/5 rounded-[3rem]">
          <div className="flex bg-zinc-100/50 p-1.5 rounded-2xl mb-10 border border-zinc-200/50">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all",
                isLogin ? "white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Protocol Access
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all",
                !isLogin ? "white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Unit Init
            </button>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="ouro-button w-full h-14 text-xs tracking-widest group shadow-xl shadow-zinc-900/10 mb-8"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Chrome className="w-4 h-4" />
                <span>CONTINUE WITH GOOGLE</span>
              </>
            )}
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-6 text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-300">Synchronize via Email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ouro-input pl-14 py-4 text-xs font-bold"
                  placeholder="DESIGNATION@PROTOCOL.EDU"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ouro-input pl-14 pr-12 py-4 text-xs font-mono tracking-widest"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl"
                >
                  <p className="text-red-500 text-[10px] font-bold leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="ouro-button-secondary w-full h-14 text-[10px] tracking-widest group mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'INITIATE SESSION' : 'REGISTER UNIT'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.2em] uppercase"
        >
          Secured by <span className="text-zinc-900">Neural Encryption Layer</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
