import { fetchClient } from '@/lib/services/fetchClient';
import type { UserRole } from '@/lib/services/userService';

// TODO: BE GET /invitations/:token 응답과 타입이 다름
// BE는 id, organizationId, usedAt, expiresAt, organization.id도 함께 내려줌
// role은 초대 생성 스키마상 GENERAL | ADMIN만 올 수 있는데 여기서는 SUPER_ADMIN까지 포함한 UserRole을 씀 전체 확인 및 리팩터
export type Invitation = {
  email: string;
  name: string;
  role: UserRole;
  organization: { name: string };
};

export async function getInvitation(token: string): Promise<Invitation> {
  return fetchClient<Invitation>(`/invitations/${encodeURIComponent(token)}`);
}
