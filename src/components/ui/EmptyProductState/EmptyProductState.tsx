import type { ReactNode } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import SubtractIcon from '@/assets/icons/subtract.svg';

import Button from '../Button/Button';

type EmptyProductStateProps = {
  prefix?: ReactNode;
};
export default function EmptyProductState({ prefix }: EmptyProductStateProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-center items-center px-[24px] m-auto lg:w-[1400px]">
      {prefix}
      <div className="w-[310px] flex flex-col items-center mt-[60px]">
        <div className="w-[100px] h-[100px] mb-[30px] rounded-[100%] flex justify-center items-center bg-primary-25">
          <Image src={SubtractIcon} alt="상품 리스트 없음 아이콘" />
        </div>
        <h1 className="text-24-bold mb-[10px]">요청 내역이 없어요</h1>
        <p className="text-16-regular leading-[160%] mb-[50px]">
          상품 리스트를 둘러보고
          <br /> 상품을 담아보세요
        </p>
        <Button
          text="상품 리스트로 이동"
          type="button"
          variant="primary"
          onClick={() => {
            router.push('/products');
          }}
        />
      </div>
    </div>
  );
}
