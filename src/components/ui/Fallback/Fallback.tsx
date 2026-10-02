// 사용법:
// <Fallback icon={<아이콘/>} title="제목" description={"서브 문구"} actionText="버튼 텍스트" onAction={콜백} />
import { Fragment, type ReactNode } from 'react';

import Button from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';

type FallbackProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
};

export default function Fallback({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
}: FallbackProps) {
  const lines = description.split('\n');

  return (
    <div
      className={cn(
        'flex min-h-dvh w-full items-center justify-center px-6',
        className,
      )}
    >
      <div className="flex w-[310px] flex-col items-center gap-5 md:gap-[30px]">
        {icon}
        <div className="flex w-full flex-col items-center gap-10 md:gap-[50px]">
          <div className="flex w-full flex-col items-center gap-2.5 text-center">
            <p className="text-18-extrabold text-primary-950 md:text-24-extrabold">
              {title}
            </p>
            <p className="text-14-regular-lead text-primary-800 md:text-16-regular-lead">
              {lines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </p>
          </div>
          {actionText && onAction && (
            <Button text={actionText} onClick={onAction} />
          )}
        </div>
      </div>
    </div>
  );
}
