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

const TOKEN_KEY = "enviar_auth_token";
const REFRESH_KEY = "enviar_refresh_token";
const USER_KEY = "enviar_user_id";
const PROFILE_KEY = "enviar_user_profile";

// Migrate old "neo_*" keys to "enviar_*" so existing sessions survive the rename
function migrateStorageKeys(s: Storage) {
  const migrations: [string, string][] = [
    ["neo_auth_token", TOKEN_KEY],
    ["neo_refresh_token", REFRESH_KEY],
    ["neo_user_id", USER_KEY],
    ["neo_user_profile", PROFILE_KEY],
  ];
  for (const [oldKey, newKey] of migrations) {
    const val = s.getItem(oldKey);
    if (val && !s.getItem(newKey)) {
      s.setItem(newKey, val);
    }
    s.removeItem(oldKey);
  }
}

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
    const rt = s?.getItem(REFRESH_KEY);
    // Notify server — fire-and-forget so local state always clears
    if (rt) {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      fetch(`${baseUrl}/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => {});
    }
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
    migrateStorageKeys(s);
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
