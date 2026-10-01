'use client';

import { useEffect, useRef, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import Pagination from '@/components/ui/List/Pagination';
import CompleteModal from '@/components/ui/Modal/CompleteModal';
import InviteMemberModal from '@/components/ui/Modal/InviteMemberModal';
import WithdrawConfirmModal from '@/components/ui/Modal/WithdrawConfirmModal';
import SearchBar from '@/components/ui/SearchBar/SearchBar';
import { useMemberMutations } from '@/hooks/members/useMemberMutations';
import { useMembers } from '@/hooks/members/useMembers';
import { type Member } from '@/lib/services/superAdminService';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';
import { getErrorMessage } from '@/utils/getErrorMessage';

import MemberTable from './_components/MemberTable';

const SEARCH_DEBOUNCE_MS = 300;

export default function Page() {
  const { openModal, closeModal } = useModal();
  const { open: openToast } = useToast();
  const [keyword, setKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  // 탈퇴로 행이 사라지거나 모바일 메뉴가 닫혀 모달을 연 요소가 없을 때 포커스를 받는다.
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keyword]);

  const { members, totalPages, isLoading, errorMessage } = useMembers({
    keyword: debouncedKeyword,
    page,
  });
  const {
    inviteMemberMutation,
    changeMemberRoleMutation,
    deactivateMemberMutation,
  } = useMemberMutations();

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
                message="권한이 변경되었습니다"
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
      { fallbackFocus: () => headingRef.current },
    );
  }

  function handleWithdraw(member: Member): void {
    openModal(
      <WithdrawConfirmModal
        name={member.name}
        email={member.email}
        onConfirm={async () => {
          try {
            await deactivateMemberMutation.mutateAsync(member.id);
            closeModal();
          } catch (error) {
            openToast({
              text: getErrorMessage(error, '회원 탈퇴에 실패했습니다.'),
            });
          }
        }}
      />,
      { fallbackFocus: () => headingRef.current },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <h1 ref={headingRef} tabIndex={-1} className="text-24-bold text-black">
          회원 관리
        </h1>
        <Button
          text="회원 초대하기"
          onClick={handleInvite}
          className="w-[140px] lg:w-[200px]"
        />
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="sr-only">회원 목록</h2>

        <SearchBar
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="w-full lg:w-auto"
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
      </section>
    </div>
  );
}
