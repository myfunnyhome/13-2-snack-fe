'use client';

import { type PropsWithChildren, createContext, useContext } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { checkAuthWithRefresh } from '@/lib/auth/session';
import {
  type SigninInput,
  signin,
  signout,
} from '@/lib/services/authService';
import { type MeProfile, getMe } from '@/lib/services/userService';

type AuthContextValue = {
  user: MeProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: SigninInput) => Promise<MeProfile | null>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<MeProfile | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ME_QUERY_KEY = ['me'] as const;

async function fetchCurrentUser(): Promise<MeProfile | null> {
  const hasToken = await checkAuthWithRefresh();

  if (!hasToken) {
    return null;
  }

  try {
    const currentUser = await getMe();

    // 우선 role 별로 console 표시 화면 확인용 임시 로그 추후 삭제 예정
    if (process.env.NODE_ENV === 'development') {
      console.log('[auth]', currentUser.role, currentUser.name);
    }

    return currentUser;
  } catch (error) {
    console.error('사용자 정보를 가져오는데 실패했습니다:', error);
    return null;
  }
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
  });

  const user = meQuery.data ?? null;
  const isLoading = meQuery.isPending;

  const refetchUser = async (): Promise<MeProfile | null> => {
    const result = await meQuery.refetch();
    return result.data ?? null;
  };

  const signinMutation = useMutation({ mutationFn: signin });
  const signoutMutation = useMutation({ mutationFn: signout });

  const login = async (input: SigninInput): Promise<MeProfile | null> => {
    await signinMutation.mutateAsync(input);
    return refetchUser();
  };

  const logout = async (): Promise<void> => {
    try {
      await signoutMutation.mutateAsync();
    } finally {
      queryClient.setQueryData(ME_QUERY_KEY, null);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
