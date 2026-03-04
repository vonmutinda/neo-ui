import { create } from "zustand";

interface UserProfile {
  id: string;
  phoneNumber: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  kycLevel?: number;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, userId: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
  setUserProfile: (profile: UserProfile) => void;
}

const TOKEN_KEY = "neo_auth_token";
const REFRESH_KEY = "neo_refresh_token";
const USER_KEY = "neo_user_id";
const PROFILE_KEY = "neo_user_profile";

function getStorage(): Storage | null {
  return typeof window !== "undefined" ? sessionStorage : null;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  userId: null,
  userProfile: null,
  isAuthenticated: false,

  login: (token: string, refreshToken: string, userId: string) => {
    const s = getStorage();
    s?.setItem(TOKEN_KEY, token);
    s?.setItem(REFRESH_KEY, refreshToken);
    s?.setItem(USER_KEY, userId);
    set({ token, refreshToken, userId, isAuthenticated: true });
  },

  setTokens: (token: string, refreshToken: string) => {
    const s = getStorage();
    s?.setItem(TOKEN_KEY, token);
    s?.setItem(REFRESH_KEY, refreshToken);
    set({ token, refreshToken });
  },

  logout: () => {
    const s = getStorage();
    s?.removeItem(TOKEN_KEY);
    s?.removeItem(REFRESH_KEY);
    s?.removeItem(USER_KEY);
    s?.removeItem(PROFILE_KEY);
    set({
      token: null,
      refreshToken: null,
      userId: null,
      userProfile: null,
      isAuthenticated: false,
    });
  },

  hydrate: () => {
    const s = getStorage();
    if (!s) return;
    const token = s.getItem(TOKEN_KEY);
    const refreshToken = s.getItem(REFRESH_KEY);
    const userId = s.getItem(USER_KEY);
    let userProfile: UserProfile | null = null;
    try {
      const raw = s.getItem(PROFILE_KEY);
      if (raw) userProfile = JSON.parse(raw);
    } catch {
      /* corrupted profile, ignore */
    }
    if (token && userId) {
      set({ token, refreshToken, userId, userProfile, isAuthenticated: true });
    }
  },

  setUserProfile: (profile: UserProfile) => {
    try {
      getStorage()?.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* storage full, ignore */
    }
    set({ userProfile: profile });
  },
}));
