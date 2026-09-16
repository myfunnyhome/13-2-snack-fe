import { fetchClient } from '@/lib/services/fetchClient';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'GENERAL';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number;
  organizationName?: string;
};

export async function getMe(): Promise<User> {
  return fetchClient<User>('/me');
}
