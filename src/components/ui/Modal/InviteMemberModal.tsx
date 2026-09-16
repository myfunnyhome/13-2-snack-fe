'use client';

import Button from '@/components/ui/Button/Button';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import TextField from '@/components/ui/TextField/TextFieldInput';
import { useModalForm } from '@/hooks/common/useModalForm';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';

type InviteMemberRole = 'ADMIN' | 'GENERAL';

type InviteMemberFormData = {
  name: string;
  email: string;
  role: InviteMemberRole;
};

type InviteMemberModalProps = {
  onSubmit: (formData: InviteMemberFormData) => void;
  className?: string;
};

const ROLE_OPTIONS: Array<{ value: InviteMemberRole; label: string }> = [
  { value: 'ADMIN', label: '관리자' },
  { value: 'GENERAL', label: '일반 사용자' },
];

function isInviteMemberRole(value: string): value is InviteMemberRole {
  return ROLE_OPTIONS.some((option) => option.value === value);
}

export default function InviteMemberModal({
  onSubmit,
  className,
}: InviteMemberModalProps) {
  const { closeModal } = useModal();

  const { formData, setFormData, handleInputChange, handleSubmit } =
    useModalForm<InviteMemberFormData>(
      { name: '', email: '', role: 'ADMIN' },
      onSubmit,
    );

  const handleRoleChange = (role: string): void => {
    if (!isInviteMemberRole(role)) return;

    setFormData((currentFormData) => ({
      ...currentFormData,
      role,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex h-dvh w-screen flex-col bg-white px-6 pt-4 pb-6',
        'md:h-auto md:w-[90vw] md:max-w-[600px] md:items-center',
        'md:gap-8 md:rounded-xs md:px-[60px] md:py-[40px]',
        'md:drop-shadow-[0px_0px_20px_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <h2 className="text-18-bold flex h-7 items-center justify-center text-primary-950">
        회원 초대
      </h2>

      <div className="mt-[52px] flex w-full flex-col gap-7 md:mt-0 md:gap-9">
        <div className="flex flex-col gap-5">
          <TextField
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="이름을 입력해주세요"
            autoComplete="name"
            required
            className="w-full"
          />

          <TextField
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일을 입력해주세요"
            autoComplete="email"
            required
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-16-bold text-primary-950">권한</span>

          <DropdownButton
            containerClassName="w-full"
            value={formData.role}
            onChange={handleRoleChange}
            placeholder="권한 선택"
            className={cn(
              'h-11 w-full rounded-none border-primary-100 px-4 py-[10px]',
              'text-16-regular leading-none text-primary-950',
            )}
            listClassName="rounded-none border-primary-100"
          >
            {ROLE_OPTIONS.map(({ value, label }) => (
              <DropdownItem
                key={value}
                value={value}
                className="h-[50px] px-4 py-0 text-16-regular"
              >
                {label}
              </DropdownItem>
            ))}
          </DropdownButton>
        </div>
      </div>

      <div className="mt-auto flex w-full items-center gap-4 md:mt-0 md:gap-5">
        <Button
          type="button"
          text="취소"
          variant="secondary"
          onClick={closeModal}
          className="h-16 flex-1 py-0 text-16-bold"
        />

        <Button
          text="등록하기"
          type="submit"
          className="h-16 flex-1 border border-transparent py-0 text-16-bold"
        />
      </div>
    </form>
  );
}
