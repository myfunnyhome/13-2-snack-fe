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

import {
  type SigninInput,
  type SignupInput,
  signin,
  signout,
  signup,
} from '@/lib/services/authService';
import { type User, getMe } from '@/lib/services/userService';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: SigninInput) => Promise<User>;
  register: (input: SignupInput) => Promise<User>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await getMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    async function initializeAuth(): Promise<void> {
      setIsLoading(true);
      await refetchUser();
      setIsLoading(false);
    }

    void initializeAuth();
  }, [refetchUser]);

  const login = useCallback(async (input: SigninInput): Promise<User> => {
    const signedInUser = await signin(input);
    setUser(signedInUser);
    return signedInUser;
  }, []);

  const register = useCallback(async (input: SignupInput): Promise<User> => {
    const signedUpUser = await signup(input);
    setUser(signedUpUser);
    return signedUpUser;
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
