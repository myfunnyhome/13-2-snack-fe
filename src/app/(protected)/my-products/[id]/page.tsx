'use client';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button/Button';
import { statusBadgeMenu } from '@/constants/badgeMenu';
import * as orderService from '@/lib/services/orderService';
import { formatDate } from '@/utils/date';

import InfoTable from '../_components/InfoTable';
import ProductCardListItem from '../_components/ProductCardListItem';

export default function MyProductsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isFetching, isError } = useQuery({
    queryKey: ['myProduct', id],
    queryFn: () => orderService.getMyOrder(Number(id)),
  });
  console.log(data);
  const productPriceTotal =
    data?.items.reduce((total, item) => total + item.subtotal, 0) ?? 0;

  if (isFetching) return <div>로딩 중...</div>;
  if (isError) {
    /*추후 상세 에러 처리 로직 추가 예정*/
    alert('데이터를 불러오는 중 에러가 났습니다.');
    router.push('/my-products');
  }
  return (
    <div className="px-[24px] pb-[24px] lg:w-[1200px] lg:m-auto">
      <h1 className="text-18-bold mb-[30px]">구매 요청 내역</h1>
      <h2 className="text-16-bold text-primary-950 mb-[20px]">
        요청 품목{' '}
        <span className="text-16-regular">총 {data?.items.length}개</span>
      </h2>
      <div className="pt-[20px] pb-[30px] px-[20px] shadow-[0_0_6px_0_rgba(0,0,0,0.1)]">
        {data?.items.map((item) => (
          <ProductCardListItem
            key={item.productId}
            imageSrc={item.imageUrl}
            imageAlt={`${item.productName} 사진`}
            name={item.productName}
            price={item.priceAtOrder}
            purchaseCount={item.quantity}
          />
        ))}
        <div className="flex flex-col mt-[20px] gap-[10px]">
          <div className="flex justify-between text-16-bold text-primary-700">
            <p>주문금액</p>
            <p>{productPriceTotal.toLocaleString()}원</p>
          </div>
          <div className="flex justify-between text-16-bold text-primary-700">
            <p>배송비</p>
            <p>3,000원</p>
          </div>
          <div className="flex justify-between text-18-bold text-primary-950 mt-[10px]">
            <p>총 주문금액</p>
            <p>{(productPriceTotal + 3000).toLocaleString()}원</p>
          </div>
        </div>
      </div>
      <div className="w-full mt-[30px]">
        <InfoTable
          title="요청 정보"
          data={[
            { label: '요청인', value: data?.requester.name },
            { label: '요청 날짜', value: formatDate(data?.createdAt ?? '') },
            {
              label: '요청 메시지',
              value: data?.requestMessage,

              fullWidth: true,
            },
          ]}
        />
        <InfoTable
          title="승인 정보"
          data={[
            { label: '담당자', value: '뉘시유' },
            { label: '승인 날짜', value: formatDate(data?.updatedAt ?? '') },
            {
              label: '상태',
              value: statusBadgeMenu.find((menu) => menu.label === data?.status)
                ?.name,
            },
            {
              label: '결과 메세지',
              value: data?.responseMessage,
            },
          ]}
        />
      </div>
      <div className="flex gap-[20px] mt-[44px]">
        <Button
          text="목록 보기"
          type="button"
          variant="secondary"
          onClick={() => {
            router.push('/my-products');
          }}
        />
        <Button
          text="장바구니에 다시 담기"
          type="button"
          variant="primary"
          onClick={() => {
            router.push('/cart');
          }}
        />
      </div>
    </div>
  );
}
