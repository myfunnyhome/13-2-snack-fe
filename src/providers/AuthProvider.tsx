'use client';

import { type PropsWithChildren, createContext, useContext } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

import { checkAuthWithRefresh } from '@/lib/auth/session';
import {
  type SigninInput,
  signin,
  signout,
} from '@/lib/services/authService';
import {
  type MeProfile,
  type UpdateMeInput,
  getMe,
  updateMe,
} from '@/lib/services/userService';

type AuthContextValue = {
  user: MeProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: SigninInput) => Promise<MeProfile | null>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<MeProfile | null>;
  updateProfile: (input: UpdateMeInput) => Promise<MeProfile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ME_QUERY_KEY = ['me'] as const;

const PUBLIC_PATHS = ['/', '/signin', '/signup', '/invite/signup'];

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
  const pathname = usePathname();

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
    enabled: !PUBLIC_PATHS.includes(pathname),
  });

  const user = meQuery.data ?? null;
  const isLoading = meQuery.isPending;

  const refetchUser = async (): Promise<MeProfile | null> => {
    const result = await meQuery.refetch();
    return result.data ?? null;
  };

  const signinMutation = useMutation({ mutationFn: signin });
  const signoutMutation = useMutation({ mutationFn: signout });
  const updateProfileMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }),
  });

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

  const updateProfile = (input: UpdateMeInput): Promise<MeProfile> =>
    updateProfileMutation.mutateAsync(input);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    refetchUser,
    updateProfile,
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
