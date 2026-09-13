import { CheckIcon, CloseIcon, ExclamationIcon } from '@/components/icons';

export default function Home() {
  return (
    <div>
      <ExclamationIcon />
      <ExclamationIcon fill="var(--color-red)" />
      <CloseIcon />
      <CloseIcon fill="var(--color-primary-500)" />
      <CloseIcon fill="#FF8484" />
      <CheckIcon />
      <CheckIcon fill="#76CDFF" />
    </div>
  );
}
