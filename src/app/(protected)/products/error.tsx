'use client';

import { useEffect } from 'react';

import Link from 'next/link';

/*
@ 상품 리스트·상세 전용 에러 경계
- 렌더 중 예외가 나면 이 화면으로 바뀐다. 없으면 루트 global-error까지 올라가
  GNB를 포함한 화면 전체가 교체된다. 여기서 잡으면 GNB는 그대로 남는다.
- API 실패는 각 화면이 직접 처리한다. 이 파일은 예상하지 못한 렌더 오류만 받는다.
- retry()는 이 구간을 다시 불러와 그린다. (Next 16.3부터 정식 prop)
*/

type ProductsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ProductsError({ error, retry }: ProductsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-20">
      <p role="alert" className="text-center text-16-regular text-primary-600">
        상품 정보를 표시하는 중 문제가 생겼습니다.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => retry()}
          className="h-11 rounded-[4px] border border-primary-200 px-4 text-14-bold text-primary-950"
        >
          다시 시도
        </button>
        <Link
          href="/products"
          className="flex h-11 items-center rounded-[4px] bg-primary-950 px-4 text-14-bold text-white"
        >
          상품 목록으로
        </Link>
      </div>
    </div>
  );
}
