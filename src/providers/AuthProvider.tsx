'use client';

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from 'react';

import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';

import {
  type SigninInput,
  type SigninUser,
  signin,
  signout,
} from '@/lib/services/authService';
import { ApiError, setSessionEndHandler } from '@/lib/services/fetchClient';
import {
  type MeProfile,
  type UpdateMeInput,
  getMe,
  updateMe,
} from '@/lib/services/userService';

type AuthContextValue = {
  user: MeProfile | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (input: SigninInput) => Promise<MeProfile | null>;
  logout: () => Promise<void>;
  updateProfile: (input: UpdateMeInput) => Promise<MeProfile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ME_QUERY_KEY = ['me'] as const;

const ME_STALE_TIME = 1000 * 10;

const PUBLIC_PATHS = [
  '/',
  '/signin',
  '/signup',
  '/invite/signup',
  '/password-reset',
  '/password-reset/request',
];

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

function clearSessionCache(queryClient: QueryClient): void {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== ME_QUERY_KEY[0],
  });
  queryClient.setQueryData(ME_QUERY_KEY, null);
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const meQuery = useQuery<MeProfile | null, Error>({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: ME_STALE_TIME,
    enabled: !PUBLIC_PATHS.includes(pathname),
  });

  const user = meQuery.data ?? null;
  const isLoading = meQuery.isPending;

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
    const result = await meQuery.refetch();
    return result.data ?? null;
  };

  const logout = async (): Promise<void> => {
    try {
      await signoutMutation.mutateAsync();
    } finally {
      clearSessionCache(queryClient);
    }
  };

  useEffect(() => {
    return setSessionEndHandler((error: ApiError): void => {
      if (queryClient.getQueryData(ME_QUERY_KEY) === null) {
        return;
      }

      clearSessionCache(queryClient);

      if (error.code === 'ACCOUNT_INACTIVE') {
        void signout().catch(() => undefined);
      }

      router.replace('/signin');
    });
  }, [queryClient, router]);

  const updateProfile = (input: UpdateMeInput): Promise<MeProfile> =>
    updateProfileMutation.mutateAsync(input);

  const value: AuthContextValue = {
    user,
    isLoading,
    error: meQuery.error,
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
