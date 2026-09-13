'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import TextArea from '@/components/ui/TextField/TextArea';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';

type ApproveRequestItem = {
  id: number;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  priceAtOrder: number;
};

type ApproveRequestFormData = {
  responseMessage: string;
};

type ApproveRequestModalProps = {
  requesterName: string;
  requesterInitials: string;
  items: ApproveRequestItem[];
  orderAmount: number;
  deliveryFee: number;
  totalAmount: number;
  remainingBudget: number;
  onConfirm: (formData: ApproveRequestFormData) => void;
  className?: string;
};

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

export default function ApproveRequestModal({
  requesterName,
  requesterInitials,
  items,
  orderAmount,
  deliveryFee,
  totalAmount,
  remainingBudget,
  onConfirm,
  className,
}: ApproveRequestModalProps) {
  const { closeModal } = useModal();

  const [responseMessage, setResponseMessage] = useState<string>('');

  const handleResponseMessageChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setResponseMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onConfirm({ responseMessage });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-[90vw] max-w-[600px] flex-col items-center',
        'gap-8 rounded-xs bg-white px-[30px] py-[40px]',
        'drop-shadow-[0px_0px_20px_rgba(0,0,0,0.1)]',
        'md:px-[60px]',
        className,
      )}
    >
      <h2 className="text-18-bold text-primary-950">구매 요청 승인</h2>

      <div className="flex w-full flex-col gap-9">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-14-regular text-primary-950"
            >
              {requesterInitials}
            </div>

            <span className="text-16-bold text-primary-950">
              {requesterName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-primary-950">
            <span className="text-16-bold">요청 품목</span>
            <span className="text-16-regular">총 {items.length}개</span>
          </div>

          <div className="flex w-full flex-col gap-5 rounded-xs bg-white px-[20px] pt-[20px] pb-[30px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.12)]">
            <ul className="flex w-full flex-col">
              {items.map((item) => {
                const itemTotal = item.priceAtOrder * item.quantity;

                return (
                  <li
                    key={item.id}
                    className="flex w-full items-center gap-5 border-b border-primary-100 py-[20px] pr-2"
                  >
                    <div className="flex min-w-0 basis-1/2 items-center gap-5">
                      {item.imageUrl ? (
                        <ProductImage
                          src={item.imageUrl}
                          alt={item.productName}
                          size={40}
                          background="bg-white"
                          className="shrink-0 rounded-none"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="size-10 shrink-0 bg-primary-50"
                        />
                      )}

                      <div className="flex min-w-0 flex-col gap-2.5">
                        <span className="truncate text-16-medium text-primary-900">
                          {item.productName}
                        </span>

                        <span className="text-16-bold text-primary-900">
                          {formatPrice(item.priceAtOrder)}
                        </span>
                      </div>
                    </div>

                    <span className="shrink-0 basis-1/5 text-16-bold text-primary-500">
                      수량 {item.quantity}개
                    </span>

                    <span className="shrink-0 basis-1/4 text-right text-20-extrabold text-primary-700">
                      {formatPrice(itemTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <dl className="flex w-full flex-col gap-2.5 px-2">
              <div className="flex items-center justify-between">
                <dt className="text-16-bold text-primary-700">주문금액</dt>
                <dd className="text-16-bold text-primary-700">
                  {formatPrice(orderAmount)}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-16-bold text-primary-700">배송비</dt>
                <dd className="text-16-bold text-primary-700">
                  {formatPrice(deliveryFee)}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-18-bold text-primary-950">총 주문금액</dt>
                <dd className="text-24-extrabold text-primary-950">
                  {formatPrice(totalAmount)}
                </dd>
              </div>
            </dl>
          </div>

          <hr className="w-full border-primary-100" />

          <div className="flex w-full items-center justify-between">
            <span className="text-18-bold text-primary-950">
              남은 예산 금액
            </span>

            <span className="text-24-extrabold text-primary-950">
              {formatPrice(remainingBudget)}
            </span>
          </div>

          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="approve-request-message"
              className="text-16-bold text-primary-950"
            >
              승인 메시지
            </label>

            <TextArea
              id="approve-request-message"
              value={responseMessage}
              onChange={handleResponseMessageChange}
              placeholder="승인 메시지를 입력해주세요"
              textareaClassName="h-[140px]"
            />
          </div>
        </div>

        <div className="flex w-full gap-5">
          <Button
            text="취소"
            variant="secondary"
            onClick={closeModal}
            className="flex-1"
          />

          <Button text="승인하기" type="submit" className="flex-1" />
        </div>
      </div>
    </form>
  );
}
