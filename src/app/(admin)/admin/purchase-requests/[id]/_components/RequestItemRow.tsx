import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { type OrderDetailItem } from '@/lib/services/purchaseRequestService';

function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`;
}

type RequestItemRowProps = {
  item: OrderDetailItem;
};

export default function RequestItemRow({ item }: RequestItemRowProps) {
  return (
    <li className="w-full border-b border-primary-100">
      <div className="flex items-start gap-3 py-5 md:hidden">
        {item.imageUrl ? (
          <ProductImage
            src={item.imageUrl}
            alt={item.productName}
            size={72}
            background="bg-primary-50"
            className="rounded-xs"
          />
        ) : (
          <div className="size-[72px] shrink-0 rounded-xs bg-primary-50" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-14-regular text-primary-950">
              {item.productName}
            </span>
            <span className="text-14-bold text-primary-950">
              {formatPrice(item.priceAtOrder)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-13-regular text-primary-500">
              수량 {item.quantity}개
            </span>
            <span className="text-16-extrabold text-primary-700">
              {formatPrice(item.subtotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-between gap-5 py-5 md:flex">
        <div className="flex items-center gap-5">
          {item.imageUrl ? (
            <ProductImage
              src={item.imageUrl}
              alt={item.productName}
              size={140}
              background="bg-primary-50"
              className="rounded-xs"
            />
          ) : (
            <div className="size-[140px] shrink-0 rounded-xs bg-primary-50" />
          )}
          <div className="flex flex-col gap-[30px] whitespace-nowrap">
            <div className="flex flex-col gap-2.5">
              <span className="text-16-regular text-primary-900">
                {item.productName}
              </span>
              <span className="text-16-bold text-primary-900">
                {formatPrice(item.priceAtOrder)}
              </span>
            </div>
            <span className="text-16-bold text-primary-500">
              수량 {item.quantity}개
            </span>
          </div>
        </div>
        <span className="text-20-extrabold text-primary-700">
          {formatPrice(item.subtotal)}
        </span>
      </div>
    </li>
  );
}
