import { fetchClient } from '@/lib/services/fetchClient';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'GENERAL';

export type MeProfile = {
  name: string;
  email: string;
  role: UserRole;
  organization: { name: string };
};

export type UpdateMeInput = {
  organizationName?: string;
  password?: string;
  passwordConfirm?: string;
};

export async function getMe(): Promise<MeProfile> {
  return fetchClient<MeProfile>('/me');
}

export async function updateMe(input: UpdateMeInput): Promise<MeProfile> {
  return fetchClient<MeProfile>('/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
