'use client';

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  type SigninInput,
  type SignupInput,
  signin,
  signout,
  signup,
} from '@/lib/services/authService';
import { ApiError } from '@/lib/services/fetchClient';
import { type MeProfile, getMe } from '@/lib/services/userService';

type AuthContextValue = {
  user: MeProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: SigninInput) => Promise<MeProfile | null>;
  register: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<MeProfile | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<MeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async (): Promise<MeProfile | null> => {
    try {
      const currentUser = await getMe();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      setUser(null);

      if (error instanceof ApiError && error.code === 'SESSION_EXPIRED') {
        router.replace('/signin');
      }

      return null;
    }
  }, [router]);

  useEffect(() => {
    async function initializeAuth(): Promise<void> {
      setIsLoading(true);
      await refetchUser();
      setIsLoading(false);
    }

    void initializeAuth();
  }, [refetchUser]);

  const login = useCallback(
    async (input: SigninInput): Promise<MeProfile | null> => {
      await signin(input);
      return refetchUser();
    },
    [refetchUser],
  );

  const register = useCallback(async (input: SignupInput): Promise<void> => {
    await signup(input);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refetchUser,
    }),
    [isLoading, login, logout, refetchUser, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
