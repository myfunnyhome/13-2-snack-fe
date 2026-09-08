'use client';

// 사용법:
// normal, sm           → <TextField size="sm" label="floating label" placeholder="text" />
// normal, sm / hasEye  → <TextField size="sm" label="floating label" hasEye />
// typing, sm           → hasEye + 포커스(클릭)
// completed, sm        → hasEye + 값이 있고 포커스 없음
// disable, sm          → disabled (눈 아이콘 없음)
// error, sm            → errorMessage="error message"
// normal, md / lg      → size="md" | "lg" suffix="원" helperText="0원"
// textarea, normal     → <TextField isMultiline />
// textarea 읽기 전용    → <TextField isMultiline readOnly />
import {
  type FocusEvent,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
  useState,
} from 'react';

import Image from 'next/image';

import visibilityOffIcon from '@/assets/icons/visibility.svg';
import visibilityOnIcon from '@/assets/icons/visibility_active.svg';
import { cn } from '@/utils/cn';

type TextFieldSize = 'sm' | 'md' | 'lg';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: TextFieldSize;
  label?: string;
  hasEye?: boolean;
  suffix?: string;
  errorMessage?: string;
  helperText?: string;
  isMultiline?: boolean;
  className?: string;
};

const TEXT_FIELD_WIDTH_CLASS: Record<TextFieldSize, string> = {
  sm: 'w-[212px]',
  md: 'w-[340px]',
  lg: 'w-[340px]',
};

const TEXT_FIELD_HEIGHT_CLASS: Record<TextFieldSize, string> = {
  sm: 'h-14',
  md: 'h-20',
  lg: 'h-[100px]',
};

const TEXT_FIELD_LABEL_CLASS: Record<TextFieldSize, string> = {
  sm: 'text-[12px]',
  md: 'text-[12px]',
  lg: 'text-[14px]',
};

const TEXT_FIELD_VALUE_CLASS: Record<TextFieldSize, string> = {
  sm: 'text-[16px]',
  md: 'text-[32px]',
  lg: 'text-[50px]',
};

const TEXT_FIELD_SUFFIX_CLASS: Record<TextFieldSize, string> = {
  sm: 'text-[16px]',
  md: 'text-[32px]',
  lg: 'text-[50px]',
};

function getInputType(
  hasEye: boolean,
  isDisabled: boolean | undefined,
  isPasswordVisible: boolean,
  type: HTMLInputTypeAttribute,
): HTMLInputTypeAttribute {
  if (hasEye && !isDisabled) {
    return isPasswordVisible ? 'text' : 'password';
  }

  return type;
}

export default function TextField({
  size = 'sm',
  label,
  hasEye = false,
  suffix,
  errorMessage,
  helperText,
  isMultiline = false,
  className,
  disabled,
  readOnly,
  placeholder,
  id,
  type = 'text',
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const hasError: boolean = Boolean(errorMessage);
  const message: string | undefined = errorMessage ?? helperText;

  const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    setIsFocused(false);
    onBlur?.(event);
  };

  // textarea, normal / textarea 읽기 전용
  if (isMultiline) {
    const textareaProps =
      inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>;

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
            'h-[165px] w-full resize-none rounded-[2px] border bg-white p-6 text-[16px] outline-none placeholder:text-primary-400',
            hasError ? 'border-error' : 'border-primary-200',
            disabled || readOnly ? 'text-primary-400' : 'text-primary-950',
            disabled && 'cursor-not-allowed',
          )}
        />
      </div>
    );
  }

  // normal, sm / hasEye / md / lg 밑줄 입력
  return (
    <div
      className={cn(
        'flex flex-col',
        hasError ? 'gap-1' : 'gap-3',
        TEXT_FIELD_WIDTH_CLASS[size],
        className,
      )}
    >
      <div
        className={cn(
          'flex items-end justify-between border-b pt-2 pr-1',
          TEXT_FIELD_HEIGHT_CLASS[size],
          hasError && 'border-error',
          disabled && 'border-primary-400',
          !hasError && !disabled && isFocused && 'border-primary-950',
          !hasError && !disabled && !isFocused && 'border-primary-900',
        )}
      >
        <label
          htmlFor={fieldId}
          className="flex h-full min-w-0 flex-1 flex-col justify-between"
        >
          {label ? (
            <span
              className={cn(TEXT_FIELD_LABEL_CLASS[size], 'text-primary-400')}
            >
              {label}
            </span>
          ) : null}
          <span className="flex min-w-0 items-center gap-1">
            <input
              {...inputProps}
              id={fieldId}
              disabled={disabled}
              placeholder={placeholder}
              type={getInputType(hasEye, disabled, isPasswordVisible, type)}
              aria-invalid={hasError}
              aria-describedby={message ? messageId : undefined}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                TEXT_FIELD_VALUE_CLASS[size],
                'w-full bg-transparent p-0 leading-none outline-none placeholder:text-primary-400 [&::-ms-reveal]:hidden',
                disabled
                  ? 'cursor-not-allowed text-primary-400'
                  : 'text-primary-950',
              )}
            />
            {suffix ? (
              <span
                className={cn(
                  TEXT_FIELD_SUFFIX_CLASS[size],
                  'shrink-0 leading-none',
                  disabled ? 'text-primary-400' : 'text-primary-950',
                )}
              >
                {suffix}
              </span>
            ) : null}
          </span>
        </label>
        {hasEye && !disabled ? ( // normal, sm / hasEye
          <button
            type="button"
            disabled={disabled}
            aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            className="shrink-0 disabled:cursor-not-allowed"
            onClick={() => {
              setIsPasswordVisible((current) => !current);
            }}
          >
            <Image
              src={isPasswordVisible ? visibilityOnIcon : visibilityOffIcon}
              alt=""
              width={24}
              height={24}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      {message ? ( // error, sm / helperText(0원)
        <p
          id={messageId}
          className={cn(
            'text-[12px]',
            hasError ? 'text-error' : 'text-primary-400',
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
