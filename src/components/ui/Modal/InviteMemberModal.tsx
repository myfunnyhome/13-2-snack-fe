'use client';

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

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

type InviteMemberModalMode = 'invite' | 'changeRole';

type InviteMemberModalProps = {
  mode?: InviteMemberModalMode;
  initialValues?: InviteMemberFormData;
  onSubmit: (formData: InviteMemberFormData) => void;
  className?: string;
};

const ROLE_OPTIONS: Array<{ value: InviteMemberRole; label: string }> = [
  { value: 'ADMIN', label: '관리자' },
  { value: 'GENERAL', label: '일반 사용자' },
];

const EMAIL_PATTERN = z.regexes.email;

const MODE_TEXT: Record<
  InviteMemberModalMode,
  { title: string; submitLabel: string }
> = {
  invite: { title: '회원 초대', submitLabel: '등록하기' },
  changeRole: { title: '권한 변경', submitLabel: '변경하기' },
};

export default function InviteMemberModal({
  mode = 'invite',
  initialValues,
  onSubmit,
  className,
}: InviteMemberModalProps) {
  const { closeModal } = useModal();
  const isChangeRole = mode === 'changeRole';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    defaultValues: initialValues ?? { name: '', email: '', role: 'ADMIN' },
  });

  const { title, submitLabel } = MODE_TEXT[mode];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        'flex h-dvh w-screen flex-col bg-white px-6 pt-4 pb-6',
        'md:h-auto md:w-[90vw] md:max-w-[600px] md:items-center',
        'md:gap-8 md:rounded-xs md:px-[60px] md:py-[40px]',
        'md:drop-shadow-[0px_0px_20px_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <h2 className="text-18-bold flex h-7 items-center justify-center text-primary-950">
        {title}
      </h2>

      <div className="mt-[52px] flex w-full flex-col gap-7 md:mt-0 md:gap-9">
        <div className="flex flex-col gap-5">
          <TextField
            placeholder="이름을 입력해주세요"
            autoComplete="name"
            disabled={isChangeRole}
            errorMessage={errors.name?.message}
            className="w-full"
            {...register('name', {
              required: '이름을 입력해주세요',
              validate: (value) =>
                value.trim().length > 0 || '이름을 입력해주세요',
            })}
          />

          <TextField
            type="email"
            placeholder="이메일을 입력해주세요"
            autoComplete="email"
            disabled={isChangeRole}
            errorMessage={errors.email?.message}
            className="w-full"
            {...register('email', {
              required: '이메일을 입력해주세요',
              pattern: {
                value: EMAIL_PATTERN,
                message: '올바른 이메일 형식이 아닙니다',
              },
            })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-16-bold text-primary-950">권한</span>

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <DropdownButton
                containerClassName="w-full"
                value={field.value}
                onChange={field.onChange}
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
            )}
          />
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
          text={submitLabel}
          type="submit"
          className="h-16 flex-1 border border-transparent py-0 text-16-bold"
        />
      </div>
    </form>
  );
}
