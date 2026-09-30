import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  type Member,
  type SearchMembersResult,
  searchMembers,
} from '@/lib/services/superAdminService';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const MEMBERS_QUERY_KEY = ['members'] as const;

const PAGE_LIMIT = 10;

type UseMembersParams = {
  keyword: string;
  page: number;
};

type UseMembersResult = {
  members: Member[];
  totalPages: number;
  isLoading: boolean;
  errorMessage: string;
};

export function useMembers({
  keyword,
  page,
}: UseMembersParams): UseMembersResult {
  const membersQuery = useQuery<SearchMembersResult, Error>({
    queryKey: [...MEMBERS_QUERY_KEY, keyword, page],
    queryFn: () =>
      searchMembers({
        keyword: keyword || undefined,
        page,
        limit: PAGE_LIMIT,
      }),
    placeholderData: keepPreviousData,
  });

  return {
    members: membersQuery.data?.users ?? [],
    totalPages: Math.max(membersQuery.data?.totalPages ?? 1, 1),
    isLoading: membersQuery.isPending,
    errorMessage: membersQuery.isError
      ? getErrorMessage(membersQuery.error, '회원 목록을 불러오지 못했습니다.')
      : '',
  };
}
