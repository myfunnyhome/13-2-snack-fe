import { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { InfoItem, InfoItemProps } from './InfoItem';

type InfoTableProps = {
  title: ReactNode;
  data: InfoItemProps[];
  onClick?: () => void;
  className?: string;
};

export default function InfoTable({
  title,
  data,
  onClick,
  className,
}: InfoTableProps) {
  return (
    <section onClick={onClick} className="mt-[30px]">
      {title}

      <div
        className={cn('border-t border-gray-400 grid grid-cols-2 ', className)}
      >
        {data.map((item, i) => (
          <InfoItem
            key={i}
            label={item.label}
            value={item.value}
            {...(item.fullWidth && { fullWidth: true })}
            {...(i % 2 === 0 &&
              i !== data.length - 1 && { className: 'border-r' })}
          />
        ))}
      </div>
    </section>
  );
}
