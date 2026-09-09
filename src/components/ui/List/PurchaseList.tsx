// import Badge from '@/components/ui/Badge/Badge';
// import Button from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';

type PurchaseListSize = 'sm' | 'md' | 'lg';

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

type PurchaseListProps = {
  name: string;
  createdAt: string | Date;
  price: number;
  size?: PurchaseListSize;
  className?: string;
};

export default function PurchaseList({
  name,
  createdAt,
  price,
  size = 'lg',
  className,
}: PurchaseListProps) {
  const formattedDate = formatDate(createdAt);
  const formattedPrice = formatPrice(price);

  if (size === 'sm') {
    return (
      <div
        className={cn(
          'flex w-full flex-col gap-5 border-b border-primary-100 py-[30px]',
          className,
        )}
      >
        <div className="flex w-full items-center justify-between">
          <p className="text-14-bold text-primary-950">{formattedDate}</p>
          {/* <Badge/> */}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-14-regular text-primary-950">{name}</p>
          <p className="text-14-regular text-primary-950">{formattedPrice}원</p>
        </div>
        {/* <Button/> */}
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div
        className={cn(
          'flex h-25 w-full items-center justify-between border-b border-primary-100',
          className,
        )}
      >
        <p className="w-25 text-16-regular text-primary-950">{formattedDate}</p>
        <p className="w-35 text-16-regular text-primary-950">{name}</p>
        <p className="w-25 text-16-regular text-primary-950">
          {formattedPrice}
        </p>
        <div className="w-25">{/* <Badge/> */}</div>
        {/* <Button/> */}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-25 w-full items-center gap-20 border-b border-primary-100 px-10',
        className,
      )}
    >
      <p className="w-45 text-16-regular text-primary-950">{formattedDate}</p>
      <p className="w-65 text-16-regular text-primary-950">{name}</p>
      <p className="w-45 text-16-regular text-primary-950">{formattedPrice}</p>
      <div className="w-45">{/* <Badge/> */}</div>
      {/* <Button/> */}
    </div>
  );
}
