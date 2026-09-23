import { InfoItem, InfoItemProps } from './InfoItem';

type InfoTableProps = {
  title: string;
  data: InfoItemProps[];
};

export default function InfoTable({ title, data }: InfoTableProps) {
  return (
    <section className="mt-[30px]">
      <h2 className="px-[8px] pb-[14px] text-16-extrabold text-primary-950">
        {title}
      </h2>

      <div className="border-t border-gray-400 grid grid-cols-2 ">
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
