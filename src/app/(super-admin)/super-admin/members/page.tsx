'use client';

import { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Button from '@/components/ui/Button/Button';
import Pagination from '@/components/ui/List/Pagination';
import CompleteModal from '@/components/ui/Modal/CompleteModal';
import InviteMemberModal from '@/components/ui/Modal/InviteMemberModal';
import WithdrawConfirmModal from '@/components/ui/Modal/WithdrawConfirmModal';
import SearchBar from '@/components/ui/SearchBar/SearchBar';
import {
  type ManagedRole,
  type Member,
  changeMemberRole,
  deactivateMember,
  inviteMember,
  searchMembers,
} from '@/lib/services/superAdminService';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';
import { getErrorMessage } from '@/utils/getErrorMessage';

import MemberTable from './_components/MemberTable';

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;
const MEMBERS_QUERY_KEY = 'members';

export default function Page() {
  const { openModal, closeModal } = useModal();
  const { open: openToast } = useToast();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keyword]);

  const membersQuery = useQuery({
    queryKey: [MEMBERS_QUERY_KEY, debouncedKeyword, page],
    queryFn: () =>
      searchMembers({
        keyword: debouncedKeyword || undefined,
        page,
        limit: PAGE_LIMIT,
      }),
  });

  const members = membersQuery.data?.users ?? [];
  const totalPages = Math.max(membersQuery.data?.totalPages ?? 1, 1);
  const isLoading = membersQuery.isPending;
  const errorMessage = membersQuery.isError
    ? getErrorMessage(membersQuery.error, '회원 목록을 불러오지 못했습니다.')
    : '';

  const invalidateMembers = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });

  const inviteMemberMutation = useMutation({ mutationFn: inviteMember });

  const changeMemberRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: ManagedRole }) =>
      changeMemberRole(id, role),
    onSuccess: invalidateMembers,
  });

  const deactivateMemberMutation = useMutation({
    mutationFn: deactivateMember,
    onSuccess: invalidateMembers,
  });

  function handleInvite(): void {
    openModal(
      <InviteMemberModal
        mode="invite"
        onSubmit={async (formData) => {
          try {
            await inviteMemberMutation.mutateAsync(formData);
            openModal(
              <CompleteModal message="초대되었습니다" onConfirm={closeModal} />,
            );
          } catch (error) {
            openToast({
              text: getErrorMessage(error, '회원 초대에 실패했습니다.'),
            });
          }
        }}
      />,
    );
  }

  function handleChangeRole(member: Member): void {
    openModal(
      <InviteMemberModal
        mode="changeRole"
        initialValues={{
          name: member.name,
          email: member.email,
          role: member.role,
        }}
        onSubmit={async (formData) => {
          try {
            await changeMemberRoleMutation.mutateAsync({
              id: member.id,
              role: formData.role,
            });
            openModal(
              <CompleteModal
                message="비밀번호가 변경되었습니다"
                onConfirm={closeModal}
              />,
            );
          } catch (error) {
            openToast({
              text: getErrorMessage(error, '권한 변경에 실패했습니다.'),
            });
          }
        }}
      />,
    );
  }

  function handleWithdraw(member: Member): void {
    openModal(
      <WithdrawConfirmModal
        name={member.name}
        email={member.email}
        onConfirm={async () => {
          await deactivateMemberMutation.mutateAsync(member.id);
          closeModal();
        }}
      />,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <h1 className="text-24-bold text-black">회원 관리</h1>
        <Button
          text="회원 초대하기"
          onClick={handleInvite}
          className="w-[140px] lg:w-[200px]"
        />
      </div>

      <SearchBar
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        className="w-full md:w-[420px] lg:w-auto"
      />

      {errorMessage ? (
        <p className="text-error text-[12px]">{errorMessage}</p>
      ) : null}

      <MemberTable
        members={members}
        isLoading={isLoading}
        onChangeRole={handleChangeRole}
        onWithdraw={handleWithdraw}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
