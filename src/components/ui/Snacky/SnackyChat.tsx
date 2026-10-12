'use client';

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';

import snackyIcon from '@/assets/icons/snacky.svg';
import Button from '@/components/ui/Button/Button';
import { type SnackyAnswer, askSnacky } from '@/lib/services/snackyService';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/getErrorMessage';

import SnackyIntro, { SNACKY_GREETING } from './SnackyIntro';
import SnackyMessageItem, { type SnackyMessage } from './SnackyMessageItem';

const SNACKY_ERROR_MESSAGE =
  '답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.';

export default function SnackyChat() {
  const [messages, setMessages] = useState<SnackyMessage[]>([]);
  const [question, setQuestion] = useState<string>('');
  const messageListRef = useRef<HTMLDivElement>(null);

  const { mutate: sendQuestion, isPending } = useMutation<
    SnackyAnswer,
    Error,
    string
  >({
    mutationFn: askSnacky,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'snacky', text: data.answer }]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        { role: 'snacky', text: getErrorMessage(error, SNACKY_ERROR_MESSAGE) },
      ]);
    },
  });

  const trimmedQuestion = question.trim();
  const canSend = trimmedQuestion.length > 0 && !isPending;

  useEffect(() => {
    const messageList = messageListRef.current;

    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages, isPending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text: trimmedQuestion }]);
    setQuestion('');
    sendQuestion(trimmedQuestion);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (
      event.key === 'Enter' &&
      (event.metaKey || event.ctrlKey) &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <>
      {messages.length === 0 ? (
        <SnackyIntro />
      ) : (
        <div
          ref={messageListRef}
          role="log"
          aria-live="polite"
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6"
        >
          <SnackyMessageItem role="snacky" text={SNACKY_GREETING} />
          {messages.map((message, index) => (
            <SnackyMessageItem key={index} {...message} />
          ))}
          {isPending ? (
            <div className="flex items-center gap-[10px]">
              <Image src={snackyIcon} alt="" width={28} height={28} />
              {/* 애니메이션이 꺼지면 Figma 정지 화면(진한 점 → 옅은 점)으로 보인다. */}
              <span className="flex gap-2 px-0.5">
                <span className="size-2 rounded-full bg-primary-950 motion-safe:animate-typing-dot" />
                <span className="size-2 rounded-full bg-primary-950 opacity-45 motion-safe:animate-typing-dot motion-safe:[animation-delay:200ms]" />
                <span className="size-2 rounded-full bg-primary-950 opacity-20 motion-safe:animate-typing-dot motion-safe:[animation-delay:400ms]" />
                <span className="sr-only">답변 생성 중</span>
              </span>
            </div>
          ) : null}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-primary-100 px-4 pt-3 pb-[14px]"
      >
        <div
          className={cn(
            'flex min-h-[64px] items-center gap-2 rounded-[2px] border border-primary-200 pt-3 pr-2 pb-2 pl-[14px]',
            question && 'border-primary-950',
          )}
        >
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력해주세요"
            aria-label="Snacky에게 보낼 메시지"
            rows={2}
            className="h-[44px] min-w-0 flex-1 resize-none text-[15px] leading-[22px] text-primary-950 outline-none placeholder:text-primary-400"
          />
          <Button
            type="submit"
            text="전송"
            size="sm"
            disabled={!canSend}
            className="h-[36px] w-[64px] shrink-0 text-14-regular"
          />
        </div>
        <p className="flex items-center gap-1 text-[11px] text-primary-400">
          <kbd className="rounded-[2px] bg-primary-50 px-[5px] py-px font-suit text-primary-600">
            Cmd
          </kbd>
          +
          <kbd className="rounded-[2px] bg-primary-50 px-[5px] py-px font-suit text-primary-600">
            Enter
          </kbd>
          로 전송 · Enter는 줄바꿈
        </p>
      </form>
    </>
  );
}
