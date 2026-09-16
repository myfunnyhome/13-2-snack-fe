import { fetchClient } from '@/lib/services/fetchClient';
import type { User } from '@/lib/services/userService';

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

export async function signin(input: SigninInput): Promise<User> {
  return fetchClient<User>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(input),
    skipRefresh: true,
  });
}

export async function signup(input: SignupInput): Promise<User> {
  return fetchClient<User>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
    skipRefresh: true,
  });
}

export async function signout(): Promise<void> {
  return fetchClient<void>('/auth/signout', {
    method: 'POST',
    skipRefresh: true,
  });
}
