import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  university?: string;
  major?: string;
  courses?: string[];
  interests?: string[];
  futureCareerGoals?: string;
  startupInterests?: string[];
  preferredIndustries?: string[];
  onboardingCompleted?: boolean;
}

interface AppState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
