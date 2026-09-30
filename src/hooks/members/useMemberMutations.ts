import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type ChangeMemberRoleInput,
  type InviteMemberInput,
  type Member,
  changeMemberRole,
  deactivateMember,
  inviteMember,
} from '@/lib/services/superAdminService';

import { MEMBERS_QUERY_KEY } from './useMembers';

export function useMemberMutations() {
  const queryClient = useQueryClient();

  const invalidateMembers = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });

  const inviteMemberMutation = useMutation<void, Error, InviteMemberInput>({
    mutationFn: inviteMember,
  });

  const changeMemberRoleMutation = useMutation<
    Member,
    Error,
    ChangeMemberRoleInput
  >({
    mutationFn: ({ id, role }) => changeMemberRole(id, role),
    onSuccess: invalidateMembers,
  });

  const deactivateMemberMutation = useMutation<Member, Error, number>({
    mutationFn: deactivateMember,
    onSuccess: invalidateMembers,
  });

  return {
    inviteMemberMutation,
    changeMemberRoleMutation,
    deactivateMemberMutation,
  };
}
