// 사용법:
// <ProductList imageUrl={상품이미지} name="상품명" createdAt={등록일} category="카테고리" price={1900} productUrl={링크} size="lg" />
// size: 'md'(TB) / 'lg'(PC, 기본) — sm(모바일) 없음 / imageUrl, productUrl: null 가능 (없으면 각각 placeholder, '-' 표시)
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { cn } from '@/utils/cn';

type ProductListSize = 'md' | 'lg';

export const PRODUCT_LIST_DESKTOP_COLUMNS =
  'grid w-full grid-cols-[minmax(0,1fr)_11.25rem_11.25rem_10rem_minmax(0,1fr)] items-center gap-20';

function formatDate(date: string | Date): string {
  const target = new Date(date);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

function renderProductUrl(
  productUrl: string | null | undefined,
  className: string,
): React.JSX.Element {
  if (!productUrl) {
    return <p className={className}>-</p>;
  }

  return (
    <a
      href={productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, 'hover:underline')}
    >
      {productUrl}
    </a>
  );
}

type ProductListProps = {
  imageUrl?: string | null;
  name: string;
  createdAt: string | Date;
  category: string;
  price: number;
  productUrl?: string | null;
  size?: ProductListSize;
  className?: string;
};

export default function ProductList({
  imageUrl,
  name,
  createdAt,
  category,
  price,
  productUrl,
  size = 'lg',
  className,
}: ProductListProps) {
  const formattedDate = formatDate(createdAt);
  const formattedPrice = formatPrice(price);

  if (size === 'md') {
    return (
      <div
        className={cn(
          'flex w-full flex-col gap-[10px] border-b border-primary-100 py-[30px]',
          className,
        )}
      >
        <p className="text-16-extrabold text-primary-950">{formattedDate}</p>
        <div className="flex items-center gap-5">
          {imageUrl ? (
            <ProductImage
              src={imageUrl}
              alt={name}
              size={90}
              background="bg-primary-50"
              className="rounded-[2px]"
            />
          ) : (
            <div className="size-[90px] shrink-0 rounded-[2px] bg-primary-50" />
          )}
          <div className="flex flex-1 flex-col gap-[10px]">
            <div className="flex flex-col gap-1">
              <p className="text-12-regular text-primary-500">{category}</p>
              <p className="text-16-regular text-primary-950">{name}</p>
              <p className="text-14-extrabold text-primary-950">
                {formattedPrice}
              </p>
            </div>
            {renderProductUrl(
              productUrl,
              'w-[180px] truncate text-14-regular text-primary-600',
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        PRODUCT_LIST_DESKTOP_COLUMNS,
        'h-25 border-b border-primary-100',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-5">
        {imageUrl ? (
          <ProductImage
            src={imageUrl}
            alt={name}
            size={40}
            background="bg-primary-25"
            className="rounded-[2px]"
          />
        ) : (
          <div className="size-10 shrink-0 rounded-[2px] bg-primary-25" />
        )}
        <p className="text-16-regular min-w-0 truncate text-primary-950">
          {name}
        </p>
      </div>
      <p className="text-16-regular text-primary-950">{formattedDate}</p>
      <p className="text-16-regular text-primary-950">{category}</p>
      <p className="text-16-regular text-primary-950">{formattedPrice}</p>
      {renderProductUrl(
        productUrl,
        'text-16-regular min-w-0 truncate text-primary-950',
      )}
    </div>
  );
}
