'use client';

// 사용법:
// normal, sm           → <TextFieldInput size="sm" label="floating label" placeholder="text" />
// normal, sm / hasEye  → <TextFieldInput size="sm" label="floating label" hasEye />
// typing, sm           → hasEye + 포커스(클릭)
// completed, sm        → hasEye + 값이 있고 포커스 없음
// disable, sm          → disabled (눈 아이콘 없음)
// error, sm            → errorMessage="error message"
// normal, md / lg      → size="md" | "lg" suffix="원"
import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FocusEvent,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
  useId,
  useState,
} from 'react';

import Image from 'next/image';

import visibilityOffIcon from '@/assets/icons/visibility.svg';
import visibilityOnIcon from '@/assets/icons/visibility_active.svg';
import { cn } from '@/utils/cn';
import {
  formatWonInput,
  parseWonAmount,
  toKoreanWon,
} from '@/utils/toKoreanWon';

type TextFieldSize = 'sm' | 'md' | 'lg';

type TextFieldInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  size?: TextFieldSize;
  label?: string;
  errorMessage?: string;
  helperText?: string;
  className?: string;
  hasEye?: boolean;
  suffix?: string;
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

function isPasswordField(
  hasEye: boolean,
  type: HTMLInputTypeAttribute,
): boolean {
  return hasEye || type === 'password';
}

function getInputType(
  hasEye: boolean,
  isPasswordVisible: boolean,
  type: HTMLInputTypeAttribute,
): HTMLInputTypeAttribute {
  if (!isPasswordField(hasEye, type)) {
    return type;
  }

  return isPasswordVisible ? 'text' : 'password';
}

function getInputValue(
  value: InputHTMLAttributes<HTMLInputElement>['value'],
): string {
  if (value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join('');
  }

  return String(value);
}

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

export default function TextFieldInput(props: TextFieldInputProps) {
  const {
    size = 'sm',
    label,
    hasEye = false,
    suffix,
    errorMessage,
    helperText,
    className,
    disabled,
    readOnly,
    placeholder,
    id,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
  } = props;
  const inputProps = omitProps(props, [
    'size',
    'label',
    'hasEye',
    'suffix',
    'errorMessage',
    'helperText',
    'className',
    'disabled',
    'readOnly',
    'placeholder',
    'id',
    'type',
    'value',
    'defaultValue',
    'onChange',
    'onFocus',
    'onBlur',
  ]);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const isControlled = value !== undefined;
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const isAmountField = suffix === '원';
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(() => {
    const initialValue = getInputValue(defaultValue);

    return suffix === '원' ? formatWonInput(initialValue) : initialValue;
  });

  const currentValue = isControlled ? getInputValue(value) : uncontrolledValue;
  const displayValue = isAmountField
    ? formatWonInput(currentValue)
    : currentValue;
  const hasError: boolean = Boolean(errorMessage);
  const koreanAmountText: string | undefined = isAmountField
    ? toKoreanWon(parseWonAmount(currentValue))
    : undefined;
  const message: string | undefined =
    errorMessage ?? koreanAmountText ?? helperText;

  const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = isAmountField
      ? formatWonInput(event.target.value)
      : event.target.value;

    if (isAmountField) {
      event.target.value = nextValue;
    }

    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(event);
  };

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
          'flex items-end justify-between border-b pt-2 pr-1 pb-[12px]',
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
              readOnly={readOnly}
              placeholder={placeholder}
              type={
                isAmountField
                  ? 'text'
                  : getInputType(hasEye, isPasswordVisible, type)
              }
              inputMode={isAmountField ? 'numeric' : undefined}
              aria-invalid={hasError}
              aria-describedby={message ? messageId : undefined}
              {...(isAmountField || isControlled
                ? { value: displayValue }
                : { defaultValue })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
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
        {hasEye && !disabled ? (
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
      {message ? (
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

export type { TextFieldInputProps };
