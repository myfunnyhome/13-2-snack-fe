// import Button from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';

type RequestListSize = 'sm' | 'md' | 'lg';

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

type RequesterProps = {
  name: string;
  avatarSize: 'sm' | 'lg';
  nameClassName?: string;
};

function Requester({ name, avatarSize, nameClassName }: RequesterProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary-50',
          avatarSize === 'sm' ? 'size-6' : 'size-8',
        )}
      >
        <p className="text-[10px] text-primary-950">{name.slice(0, 1)}</p>
      </div>
      <p className={cn('text-16-regular text-primary-950', nameClassName)}>
        {name}
      </p>
    </div>
  );
}

type RequestListProps = {
  createdAt: string | Date;
  productInfo: string;
  price: number;
  requesterName: string;
  size?: RequestListSize;
  className?: string;
};

export default function RequestList({
  createdAt,
  productInfo,
  price,
  requesterName,
  size = 'lg',
  className,
}: RequestListProps) {
  const formattedDate = formatDate(createdAt);
  const formattedPrice = formatPrice(price);

  if (size === 'sm') {
    return (
      <div
        className={cn(
          'flex w-full flex-col gap-5 border-b border-primary-100 py-6',
          className,
        )}
      >
        <div className="flex w-full items-center justify-between pr-1">
          <p className="text-14-bold text-primary-950">{formattedDate}</p>
          <Requester
            name={requesterName}
            avatarSize="sm"
            nameClassName="text-14-regular"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-14-regular text-primary-950">{productInfo}</p>
          <p className="text-20-extrabold text-primary-950">
            {formattedPrice}원
          </p>
        </div>
        <div className="flex w-full gap-2">
          {/* <Button/> */}
          {/* <Button/> */}
        </div>
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
        <p className="w-35 text-16-regular text-primary-950">{productInfo}</p>
        <p className="w-25 text-16-regular text-primary-950">
          {formattedPrice}
        </p>
        <Requester name={requesterName} avatarSize="lg" nameClassName="w-16" />
        <div className="flex items-center gap-2">
          {/* <Button/> */}
          {/* <Button/> */}
        </div>
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
      <p className="w-[142px] text-16-regular text-primary-950">
        {formattedDate}
      </p>
      <p className="w-90 text-16-regular text-primary-950">{productInfo}</p>
      <p className="w-[142px] text-16-regular text-primary-950">
        {formattedPrice}
      </p>
      <Requester
        name={requesterName}
        avatarSize="lg"
        nameClassName="w-[90px]"
      />
      <div className="flex items-center gap-2">
        {/* <Button/> */}
        {/* <Button/> */}
      </div>
    </div>
  );
}
