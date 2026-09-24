'use client';

import { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Button from '@/components/ui/Button/Button';
import MemberList from '@/components/ui/List/MemberList';
import Pagination from '@/components/ui/List/Pagination';
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

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;
const MEMBERS_QUERY_KEY = 'members';

const MEMBER_LIST_SIZES = [
  { size: 'lg', className: 'hidden lg:flex' },
  { size: 'md', className: 'hidden md:flex lg:hidden' },
  { size: 'sm', className: 'flex md:hidden' },
] as const;

export default function Page() {
  const { openModal, closeModal } = useModal();
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
    ? membersQuery.error instanceof Error
      ? membersQuery.error.message
      : '회원 목록을 불러오지 못했습니다.'
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
          await inviteMemberMutation.mutateAsync(formData);
          closeModal();
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
          await changeMemberRoleMutation.mutateAsync({
            id: member.id,
            role: formData.role,
          });
          closeModal();
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
        className="w-full md:w-[420px] lg:w-[696px]"
      />

      {errorMessage ? (
        <p className="text-error text-[12px]">{errorMessage}</p>
      ) : null}

      <div className="flex flex-col">
        <div className="hidden gap-20 border-y border-primary-100 px-5 py-5 lg:flex">
          <p className="text-16-bold w-[142px] text-primary-500">이름</p>
          <p className="text-16-bold flex-1 text-primary-500">메일</p>
          <p className="text-16-bold w-[72px] text-center text-primary-500">
            권한
          </p>
          <p className="text-16-bold w-[200px] text-center text-primary-500">
            비고
          </p>
        </div>

        {members.map((member) => (
          <div key={member.id}>
            {MEMBER_LIST_SIZES.map(({ size, className }) => (
              <MemberList
                key={size}
                name={member.name}
                email={member.email}
                authority={member.role}
                onChangeRole={() => handleChangeRole(member)}
                onWithdraw={() => handleWithdraw(member)}
                size={size}
                className={className}
              />
            ))}
          </div>
        ))}

        {!isLoading && members.length === 0 ? (
          <p className="text-16-regular py-10 text-center text-primary-500">
            회원이 없습니다.
          </p>
        ) : null}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
