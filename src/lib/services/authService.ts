import { fetchClient } from '@/lib/services/fetchClient';
import type { UserRole } from '@/lib/services/userService';

export type SigninInput = {
  email: string;
  password: string;
  turnstileToken?: string;
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

export type RequestPasswordResetInput = {
  email: string;
};

export type ResetPasswordInput = {
  resetPasswordToken: string;
  password: string;
  passwordConfirm: string;
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

export async function requestPasswordReset(
  input: RequestPasswordResetInput,
): Promise<void> {
  return fetchClient<void>('/auth/password-reset', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  return fetchClient<void>('/auth/password-reset', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
