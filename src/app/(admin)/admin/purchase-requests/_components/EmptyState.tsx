import Image from 'next/image';

import emptyIcon from '@/assets/icons/empty.svg';
import Button from '@/components/ui/Button/Button';

export default function EmptyState() {
  return (
    <div className="flex w-full flex-1 items-center justify-center py-[130px] md:py-[202px] lg:py-[151px]">
      <div className="flex w-[310px] flex-col items-center gap-5 md:gap-[30px]">
        <Image src={emptyIcon} alt="" width={100} height={100} />
        <div className="flex w-full flex-col items-center gap-10 md:gap-[50px]">
          <div className="flex w-full flex-col items-center gap-2.5 text-center">
            <p className="text-18-extrabold text-primary-950 md:text-24-extrabold">
              요청 내역이 없어요
            </p>
            <p className="text-14-regular-lead text-primary-800 md:text-16-regular-lead">
              상품 리스트를 둘러보고
              <br />
              상품을 담아보세요
            </p>
          </div>
          <Button text="상품 리스트로 이동" />
        </div>
      </div>
    </div>
  );
}
