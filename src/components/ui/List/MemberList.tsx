// 사용법:
// <MemberList name="이름" email="이메일" authority="admin" onChangeRole={권한변경콜백} onWithdraw={탈퇴콜백} size="lg" />
// size: 'sm'(MO) / 'md'(TB) / 'lg'(PC, 기본) / authority: 'admin'(관리자) | 'general'(일반)
'use client';

import Image from 'next/image';

import kebabMenuIcon from '@/assets/icons/kebab_menu.svg';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';

type MemberListSize = 'sm' | 'md' | 'lg';
type MemberAuthority = 'admin' | 'general';

const authorityLabel: Record<MemberAuthority, string> = {
  admin: '관리자',
  general: '일반',
};

type MemberListProps = {
  name: string;
  email: string;
  authority: MemberAuthority;
  onChangeRole: () => void;
  onWithdraw: () => void;
  size?: MemberListSize;
  className?: string;
};

export default function MemberList({
  name,
  email,
  authority,
  onChangeRole,
  onWithdraw,
  size = 'lg',
  className,
}: MemberListProps) {
  const isAdmin = authority === 'admin';
  if (size === 'sm') {
    return (
      <div
        className={cn(
          'flex w-full items-center gap-3 border-b border-primary-100 py-4',
          className,
        )}
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-50">
          <p className="text-[14px] text-primary-950">{name.slice(0, 1)}</p>
        </div>
        <div className="flex flex-1 items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-16-bold text-primary-950">{name}</p>
              <Badge
                type="authority"
                variant={authority}
                message={authorityLabel[authority]}
                className="shrink-0"
              />
            </div>
            <p className="w-[172px] text-16-regular text-primary-950">
              {email}
            </p>
          </div>
          <Image src={kebabMenuIcon} alt="" width={24} height={24} />
        </div>
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div
        className={cn(
          'flex h-25 w-full items-center gap-8 border-b border-primary-100 px-5',
          isAdmin && 'bg-primary-25',
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50">
            <p className="text-[10px] text-primary-950">{name.slice(0, 1)}</p>
          </div>
          <p
            className={cn(
              'w-20 text-primary-950',
              isAdmin ? 'text-16-bold' : 'text-16-regular',
            )}
          >
            {name}
          </p>
        </div>
        <p className="min-w-0 flex-1 truncate text-16-regular text-primary-950">
          {email}
        </p>
        <Badge
          type="authority"
          variant={authority}
          message={authorityLabel[authority]}
          className="shrink-0"
        />
        <div className="flex items-center gap-2">
          <Button
            text="권한 변경"
            variant="secondary"
            size="sm"
            onClick={onChangeRole}
            className="w-24"
          />
          <Button
            text="계정 탈퇴"
            variant="secondary"
            size="sm"
            onClick={onWithdraw}
            className="w-24 border-none bg-[#e9655e] text-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-25 w-full items-center gap-20 border-b border-primary-100 px-5',
        isAdmin && 'bg-primary-25',
        className,
      )}
    >
      <div className="flex items-center gap-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50">
          <p className="text-[10px] text-primary-950">{name.slice(0, 1)}</p>
        </div>
        <p
          className={cn(
            'w-[90px] text-primary-950',
            isAdmin ? 'text-16-bold' : 'text-16-regular',
          )}
        >
          {name}
        </p>
      </div>
      <p className="min-w-0 flex-1 truncate text-16-regular text-primary-950">
        {email}
      </p>
      <Badge
        type="authority"
        variant={authority}
        message={authorityLabel[authority]}
        className="shrink-0"
      />
      <div className="flex items-center gap-2">
        <Button
          text="권한 변경"
          variant="secondary"
          size="sm"
          onClick={onChangeRole}
          className="w-24"
        />
        <Button
          text="계정 탈퇴"
          variant="secondary"
          size="sm"
          onClick={onWithdraw}
          className="w-24 border-none bg-[#e9655e] text-white"
        />
      </div>
    </div>
  );
}
