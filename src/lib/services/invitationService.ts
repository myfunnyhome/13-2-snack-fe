import { fetchClient } from '@/lib/services/fetchClient';
import type { UserRole } from '@/lib/services/userService';

export type Invitation = {
  email: string;
  name: string;
  role: UserRole;
  organization: { name: string };
};

export async function getInvitation(token: string): Promise<Invitation> {
  return fetchClient<Invitation>(`/invitations/${encodeURIComponent(token)}`);
}
