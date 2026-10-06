'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import emptyIcon from '@/assets/icons/empty.svg';
import Fallback from '@/components/ui/Fallback/Fallback';

export default function NotFound() {
  const router = useRouter();

  return (
    <Fallback
      icon={<Image src={emptyIcon} alt="" width={100} height={100} />}
      title="페이지를 찾을 수 없어요"
      description="페이지가 삭제됐거나 주소가 변경됐을 수 있어요"
      actionText="홈으로"
      onAction={() => router.push('/')}
    />
  );
}
