'use client';

// 사용법:
// textarea, normal     → <TextArea textareaClassName="h-[165px]" />
// textarea 읽기 전용    → <TextArea readOnly textareaClassName="h-[165px]" />
import { type TextareaHTMLAttributes, useId } from 'react';

import { cn } from '@/utils/cn';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  errorMessage?: string;
  helperText?: string;
  className?: string;
  textareaClassName?: string;
};

function omitProps<T extends object, K extends keyof T>(
  props: T,
  keys: readonly K[],
): Omit<T, K> {
  const next = { ...props };

  keys.forEach((key) => {
    delete next[key];
  });

  return next;
}

export default function TextArea(props: TextAreaProps) {
  const {
    errorMessage,
    helperText,
    className,
    textareaClassName,
    disabled,
    readOnly,
    placeholder,
    id,
  } = props;
  const textareaProps = omitProps(props, [
    'errorMessage',
    'helperText',
    'className',
    'textareaClassName',
  ]);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const hasError: boolean = Boolean(errorMessage);
  const message: string | undefined = errorMessage ?? helperText;

  return (
    <div className={cn('w-full', className)}>
      <textarea
        {...textareaProps}
        id={fieldId}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder ?? '메시지를 입력해주세요'}
        aria-invalid={hasError}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          'w-full resize-none rounded-[2px] border bg-white p-6 text-[16px] outline-none placeholder:text-primary-400',
          hasError ? 'border-error' : 'border-primary-200',
          disabled || readOnly ? 'text-primary-400' : 'text-primary-950',
          disabled && 'cursor-not-allowed',
          textareaClassName,
        )}
      />
      {message ? (
        <p
          id={messageId}
          className={cn(
            'mt-1 text-[12px]',
            hasError ? 'text-error' : 'text-primary-400',
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export type { TextAreaProps };
