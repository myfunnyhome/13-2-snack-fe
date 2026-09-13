'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import TextField from '@/components/ui/TextField/TextFieldInput';
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

export default function InviteMemberModal({
  onSubmit,
  className,
}: InviteMemberModalProps) {
  const { closeModal } = useModal();

  const [formData, setFormData] = useState<InviteMemberFormData>({
    name: '',
    email: '',
    role: 'ADMIN',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-[90vw] max-w-[600px] flex-col items-center gap-8',
        'rounded-xs bg-white px-[30px] py-[40px]',
        'drop-shadow-[0px_0px_20px_rgba(0,0,0,0.1)]',
        'md:px-[60px]',
        className,
      )}
    >
      <h2 className="text-18-bold text-primary-950">회원 초대</h2>

      <div className="flex w-full flex-col gap-9">
        <div className="flex flex-col gap-7">
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
              onChange={(role) =>
                setFormData((currentFormData) => ({
                  ...currentFormData,
                  role: role as InviteMemberRole,
                }))
              }
              placeholder="권한 선택"
              className="h-11 w-full rounded-none border-primary-100 px-4 py-[10px] text-16-regular text-primary-950 leading-none"
              listClassName="rounded-none border-primary-100"
            >
              {ROLE_OPTIONS.map(({ value, label }) => (
                <DropdownItem
                  key={value}
                  value={value}
                  className="h-11 px-4 py-0 text-16-regular"
                >
                  {label}
                </DropdownItem>
              ))}
            </DropdownButton>
          </div>
        </div>

        <div className="flex w-full items-center gap-5">
          <Button
            text="취소"
            variant="secondary"
            onClick={closeModal}
            className="flex-1"
          />

          <Button text="등록하기" type="submit" className="flex-1" />
        </div>
      </div>
    </form>
  );
}
