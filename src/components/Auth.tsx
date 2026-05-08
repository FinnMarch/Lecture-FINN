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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 text-white mb-6 shadow-2xl">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-zinc-900 mb-2">FounderOS</h1>
          <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-semibold">Intelligence for Ambition</p>
        </div>

        <div className="premium-card p-8 bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-3xl">
          <div className="flex bg-zinc-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                isLogin ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                !isLogin ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Sign Up
            </button>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-semibold text-sm shadow-lg hover:bg-zinc-800 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5 text-white" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-zinc-400 font-semibold tracking-widest">Or login with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                  placeholder="name@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm font-mono tracking-widest"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs mt-2 px-1">{error}</p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-zinc-100 text-zinc-900 rounded-xl font-semibold text-sm hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Enter OS' : 'Initialize OS'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Form end */}
        </div>

        <p className="text-center mt-8 text-zinc-400 text-xs">
          By signing in, you agree to our <span className="text-zinc-900 underline cursor-pointer">Protocol</span> and <span className="text-zinc-900 underline cursor-pointer">Privacy Bond</span>.
        </p>
      </motion.div>
    </div>
  );
}
