'use client';

import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button/Button';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import TextArea from '@/components/ui/TextField/TextArea';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';

type PurchaseRequestDecisionVariant = 'approve' | 'reject';

type PurchaseRequestItem = {
  id: number;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  priceAtOrder: number;
  totalPrice: number;
};

type ApproveRequestFormData = {
  responseMessage: string;
};

type ApproveRequestBaseProps = {
  requesterName: string;
  requesterInitials: string;
  items: PurchaseRequestItem[];
  orderAmount: number;
  deliveryFee: number;
  totalAmount: number;
  onConfirm: (formData: ApproveRequestFormData) => void;
  className?: string;
};

type ApproveRequestModalProps =
  | (ApproveRequestBaseProps & {
      variant: 'approve';
      remainingBudget: number;
    })
  | (ApproveRequestBaseProps & {
      variant: 'reject';
    });

type DecisionText = {
  title: string;
  messageLabel: string;
  messagePlaceholder: string;
  confirmLabel: string;
};

type DecisionTextMap = Record<PurchaseRequestDecisionVariant, DecisionText>;

const DECISION_TEXT: DecisionTextMap = {
  approve: {
    title: '구매 요청 승인',
    messageLabel: '승인 메시지',
    messagePlaceholder: '승인 메시지를 입력해주세요',
    confirmLabel: '승인하기',
  },
  reject: {
    title: '구매 요청 반려',
    messageLabel: '반려 메시지',
    messagePlaceholder: '반려 메시지를 입력해주세요',
    confirmLabel: '반려하기',
  },
};

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

export type { ApproveRequestFormData, PurchaseRequestItem };

export default function ApproveRequestModal(props: ApproveRequestModalProps) {
  const {
    variant,
    requesterName,
    requesterInitials,
    items,
    orderAmount,
    deliveryFee,
    totalAmount,
    onConfirm,
    className,
  } = props;

  const { closeModal } = useModal();

  const { title, messageLabel, messagePlaceholder, confirmLabel } =
    DECISION_TEXT[variant];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApproveRequestFormData>({
    defaultValues: { responseMessage: '' },
  });

  const handleFormSubmit = handleSubmit((formValues) => {
    onConfirm(formValues);
  });

  return (
    <form
      onSubmit={handleFormSubmit}
      className={cn(
        'flex h-dvh w-screen flex-col bg-white px-6 pt-4 pb-6',
        'md:h-auto md:w-[90vw] md:max-w-[600px]',
        className,
      )}
    >
      <h2 className="text-center text-18-bold text-primary-950">{title}</h2>

      <div className="mt-[39px] flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-0 md:min-h-fit md:w-full md:gap-9 md:overflow-visible">
        <div className="flex flex-col gap-8 pb-5">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] text-primary-950"
            >
              {requesterInitials}
            </div>

            <span className="text-16-bold text-primary-950">
              {requesterName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-primary-950">
            <span className="text-16-bold">요청 품목</span>
            <span className="text-14-regular md:text-16-regular">
              총 {items.length}개
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-col gap-5 rounded-xs bg-white px-[20px] pt-[20px] pb-[30px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.12)]">
            <ul className="flex w-full flex-col">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex w-full items-center justify-between border-b border-primary-100 py-[20px] pr-2"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-[5] md:gap-5">
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

                    <div className="flex min-w-0 flex-col gap-1 md:gap-2.5">
                      <span className="truncate text-14-regular text-primary-900 md:text-16-regular">
                        {item.productName}
                      </span>

                      <span className="text-14-bold text-primary-900 md:text-16-bold">
                        {formatPrice(item.priceAtOrder)}
                      </span>
                    </div>
                  </div>

                  <div className="ml-3 flex shrink-0 flex-col items-start gap-1 md:ml-0 md:contents">
                    <span className="text-13-bold text-primary-500 md:min-w-0 md:flex-[3] md:text-16-bold">
                      수량 {item.quantity}개
                    </span>

                    <span className="text-16-bold text-primary-700 md:min-w-0 md:flex-[2] md:text-right md:text-20-extrabold">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </li>
              ))}
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
                <dt className="text-16-bold text-primary-950 md:text-18-bold">
                  총 주문금액
                </dt>
                <dd className="text-20-extrabold text-primary-950 md:text-24-extrabold">
                  {formatPrice(totalAmount)}
                </dd>
              </div>
            </dl>
          </div>

          {props.variant === 'approve' ? (
            <>
              <hr className="w-full border-primary-100" />

              <div className="flex w-full items-center justify-between">
                <span className="text-16-bold text-primary-950 md:text-18-bold">
                  남은 예산 금액
                </span>

                <span className="text-20-extrabold text-primary-950 md:text-24-extrabold">
                  {formatPrice(props.remainingBudget)}
                </span>
              </div>
            </>
          ) : null}

          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="purchase-request-response-message"
              className="text-16-bold text-primary-950"
            >
              {messageLabel}
            </label>

            <TextArea
              id="purchase-request-response-message"
              placeholder={messagePlaceholder}
              errorMessage={errors.responseMessage?.message}
              textareaClassName="h-[140px]"
              {...register('responseMessage', {
                // BE orderResponseMessageBodySchema(.trim().min(1))와 동일한 필수 검증
                validate: (value) =>
                  value.trim().length > 0 || `${messageLabel}를 입력해주세요.`,
              })}
            />
          </div>
        </div>

        <div className="mt-auto flex w-full shrink-0 gap-5 pt-7 md:mt-0 md:pt-0">
          <Button
            text="취소"
            variant="secondary"
            onClick={closeModal}
            className="flex-1"
          />

          <Button text={confirmLabel} type="submit" className="flex-1" />
        </div>
      </div>
    </form>
  );
}
