import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { cn } from '@/utils/cn';

type ProductListSize = 'md' | 'lg';

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

interface ProductListProps {
  imageUrl?: string | null;
  name: string;
  createdAt: string | Date;
  category: string;
  price: number;
  productUrl?: string | null;
  size?: ProductListSize;
  className?: string;
}

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
  const displayLink = productUrl ?? '-';

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
            <p className="w-[180px] text-14-regular text-primary-600">
              {displayLink}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-25 w-full items-center gap-20 border-b border-primary-100',
        className,
      )}
    >
      <div className="flex items-center gap-5">
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
        <p className="w-65 text-16-regular text-primary-950">{name}</p>
      </div>
      <p className="w-45 text-16-regular text-primary-950">{formattedDate}</p>
      <p className="w-45 text-16-regular text-primary-950">{category}</p>
      <p className="w-40 text-16-regular text-primary-950">{formattedPrice}</p>
      <p className="w-45 text-16-regular text-primary-950">{displayLink}</p>
    </div>
  );
}
