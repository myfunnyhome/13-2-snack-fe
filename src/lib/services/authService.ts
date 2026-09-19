import { fetchClient } from '@/lib/services/fetchClient';
import type { UserRole } from '@/lib/services/userService';

export type SigninInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  organizationName?: string;
  bizRegNumber?: string;
  invitationToken?: string;
};

export type SigninUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number;
};

export type SignupResult = {
  organization: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
};

export async function signin(input: SigninInput): Promise<SigninUser> {
  return fetchClient<SigninUser>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function signup(input: SignupInput): Promise<SignupResult> {
  return fetchClient<SignupResult>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function signout(): Promise<void> {
  return fetchClient<void>('/auth/signout', {
    method: 'POST',
  });
}
