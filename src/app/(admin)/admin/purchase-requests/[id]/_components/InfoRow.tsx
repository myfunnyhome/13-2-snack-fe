type InfoRowProps = {
  label: string;
  value: string;
  multiline?: boolean;
  paired?: boolean;
  danger?: boolean;
};

export default function InfoRow({
  label,
  value,
  multiline = false,
  paired = false,
  danger = false,
}: InfoRowProps) {
  return (
    <div className={`flex w-full ${paired ? 'md:w-1/2' : ''}`}>
      <div className="flex w-[140px] shrink-0 items-center border-r border-b border-primary-100 p-2">
        <span className="text-14-regular text-primary-950 md:text-16-regular">
          {label}
        </span>
      </div>
      <div
        className={`flex min-w-0 flex-1 border-b border-primary-100 p-4 ${multiline ? 'items-start' : 'items-center'}`}
      >
        <span
          className={`text-14-bold ${danger ? 'text-red' : 'text-primary-900'} md:text-16-bold ${multiline ? 'text-14-bold-lead md:text-16-bold-lead' : ''}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
