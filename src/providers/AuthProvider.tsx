'use client';

import { type PropsWithChildren, createContext, useContext } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

import {
  type SigninInput,
  type SigninUser,
  signin,
  signout,
} from '@/lib/services/authService';
import { ApiError } from '@/lib/services/fetchClient';
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
  updateProfile: (input: UpdateMeInput) => Promise<MeProfile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ME_QUERY_KEY = ['me'] as const;

// 로그인 직후 refetch한 데이터를 /products 이동 시 enabled 전환으로 다시 요청하지 않도록 잠시 fresh로 유지한다.
const ME_STALE_TIME = 1000 * 10;

const PUBLIC_PATHS = ['/', '/signin', '/signup', '/invite/signup'];

async function fetchCurrentUser(): Promise<MeProfile | null> {
  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const meQuery = useQuery<MeProfile | null, Error>({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: ME_STALE_TIME,
    enabled: !PUBLIC_PATHS.includes(pathname),
  });

  const user = meQuery.data ?? null;
  const isLoading = meQuery.isPending;

  const refetchUser = async (): Promise<MeProfile | null> => {
    const result = await meQuery.refetch();
    return result.data ?? null;
  };

  const signinMutation = useMutation<SigninUser, Error, SigninInput>({
    mutationFn: signin,
  });
  const signoutMutation = useMutation<void, Error, void>({
    mutationFn: signout,
  });
  const updateProfileMutation = useMutation<MeProfile, Error, UpdateMeInput>({
    mutationFn: updateMe,
    onSuccess: (_data, variables) => {
      if (variables.password !== undefined) {
        return;
      }

      return queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });

  const login = async (input: SigninInput): Promise<MeProfile | null> => {
    await signinMutation.mutateAsync(input);
    return refetchUser();
  };

  const logout = async (): Promise<void> => {
    try {
      await signoutMutation.mutateAsync();
    } finally {
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== ME_QUERY_KEY[0],
      });
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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext<AuthContextValue | null>(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
