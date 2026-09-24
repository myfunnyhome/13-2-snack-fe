import { fetchClient } from '@/lib/services/fetchClient';
import type { UserRole } from '@/lib/services/userService';

export type ManagedRole = Extract<UserRole, 'ADMIN' | 'GENERAL'>;

export type Member = {
  id: number;
  name: string;
  email: string;
  role: ManagedRole;
};

export type SearchMembersParams = {
  keyword?: string;
  page?: number;
  limit?: number;
};

export type SearchMembersResult = {
  users: Member[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

export type InviteMemberInput = {
  name: string;
  email: string;
  role: ManagedRole;
};

export async function searchMembers(
  params: SearchMembersParams,
): Promise<SearchMembersResult> {
  const query = new URLSearchParams();

  if (params.keyword) {
    query.set('keyword', params.keyword);
  }

  if (params.page !== undefined) {
    query.set('page', String(params.page));
  }

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }

  const queryString = query.toString();

  return fetchClient<SearchMembersResult>(
    `/super-admin/users${queryString ? `?${queryString}` : ''}`,
  );
}

export async function changeMemberRole(
  id: number,
  role: ManagedRole,
): Promise<Member> {
  return fetchClient<Member>(`/super-admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function deactivateMember(id: number): Promise<Member> {
  return fetchClient<Member>(`/super-admin/users/${id}`, {
    method: 'DELETE',
  });
}

export async function inviteMember(input: InviteMemberInput): Promise<void> {
  await fetchClient<unknown>('/super-admin/invitations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
