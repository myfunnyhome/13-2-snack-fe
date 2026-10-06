'use client';

import { Fragment } from 'react';

import { ExclamationIcon } from '@/components/icons';
import Button from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';

type AlertModalAction = {
  text: string;
  onClick: () => void;
};

type AlertModalProps = {
  title: string;
  descriptions: string[];
  secondaryAction: AlertModalAction;
  primaryAction: AlertModalAction;
  className?: string;
};

export default function AlertModal({
  title,
  descriptions,
  secondaryAction,
  primaryAction,
  className,
}: AlertModalProps) {
  return (
    <div
      className={cn(
        'flex w-[90vw] max-w-[327px] flex-col items-center',
        'gap-9 rounded-md bg-white px-[30px] pt-[40px] pb-[30px]',
        'drop-shadow-[0px_0px_15px_rgba(0,0,0,0.14)]',
        'md:max-w-[512px]',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-18-bold text-primary-950">{title}</h2>

        <ExclamationIcon className="hidden size-5 text-red md:block" />

        <p className="text-center text-16-regular-lead text-primary-900">
          {descriptions.map((line, index) => (
            <Fragment key={line}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="flex w-full items-center gap-2.5 md:gap-5">
        <Button
          text={secondaryAction.text}
          variant="secondary"
          onClick={secondaryAction.onClick}
          className="h-auto flex-1 py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
        />

        <Button
          text={primaryAction.text}
          onClick={primaryAction.onClick}
          className="h-auto flex-1 border border-transparent py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
        />
      </div>
    </div>
  );
}
