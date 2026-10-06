'use client';
import { ReactNode, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import SubtractIcon from '@/assets/icons/subtract.svg';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import InfoTable from '@/components/ui/Info/InfoTable';
import Pagination from '@/components/ui/List/Pagination';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import { ApprovedPurchaseList } from '@/components/ui/Purchase/PurchaseListItem';
import { sortMenu } from '@/constants/dropdownMenu';
import { useScreenSize } from '@/hooks/common/useScreenSize';
import * as adminOrderService from '@/lib/services/adminOrderService';
import * as budgetService from '@/lib/services/budgetService';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';

type MyOrganizationBudgetCardProps = {
  title: string;
  budget: number;
  text: string;
  suffix?: ReactNode;
  tooltip?: ReactNode;
  className?: string;
};
function MyOrganizationBudgetCard({
  title,
  budget,
  text,
  suffix,
  tooltip,
  className,
}: MyOrganizationBudgetCardProps) {
  return (
    <div
      className={cn(
        'relative group min-h-[150px] p-[30px] bg-primary-50 rounded-[4px]',
        className,
      )}
    >
      <h1 className="flex flex-col gap-[10px] justify-between mb-[17px] lg:flex-row">
        <p className="text-18-bold">{title}</p>
        <p className="text-24-extrabold">{budget.toLocaleString()}원</p>
      </h1>
      <p className="text-16-regular text-primary-600 whitespace-pre-line">
        {text}
      </p>
      {suffix}
      {tooltip && (
        <div className="absolute left-[10%] top-[90%] z-20 hidden group-hover:block w-full max-w-[320px] p-[20px] bg-primary-950 text-white rounded-[12px] pointer-events-none ">
          {tooltip}
        </div>
      )}
    </div>
  );
}

export default function MyOrganizationPurchasesManagement() {
  const router = useRouter();

  const [sort, setSort] = useState<adminOrderService.AdminOrderSort>('latest');
  const [page, setPage] = useState(1);
  const status = 'APPROVED';
  const screenSize = useScreenSize();
  const limit = screenSize === 'desktop' ? 4 : 3;

  const { data: orderData } = useQuery({
    queryKey: ['adminOrders', sort, page, limit],
    queryFn: () =>
      adminOrderService.getAdminOrders({
        sort,
        page,
        limit,
        status,
      }),
  });
  const { data: budgetData } = useQuery({
    queryKey: ['budget'],
    queryFn: () => budgetService.getBudgetSummary(),
  });
  console.log(budgetData);
  const currentMonthBudget = budgetData?.currentMonthBudget;
  const previousMonthBudget = budgetData?.previousMonthBudget;

  const PurchaseHeader = (
    <div className="w-full flex justify-between items-center text-18-bold mb-[40px]">
      <h1>구매 내역 확인</h1>

      <DropdownButton
        value={sort}
        onChange={(value) => setSort(value as adminOrderService.AdminOrderSort)}
        placeholder="정렬"
        listClassName="border border-primary-100"
        containerClassName="border border-primary-100 text-16-regular"
        className="border-0"
      >
        {sortMenu.map(({ label, name }) => (
          <DropdownItem
            key={label}
            value={label}
            className="text-center justify-center text-16-regular"
          >
            {name}
          </DropdownItem>
        ))}
      </DropdownButton>
    </div>
  );

  if (orderData?.items.length === 0) {
    return (
      <div className="flex flex-col items-center px-[24px] py-[30px] lg:w-[1400px]">
        {PurchaseHeader}
        <div className="w-[310px] flex flex-col items-center">
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

  return (
    <div className="p-[24px] lg:w-[1400px] lg:m-auto">
      {PurchaseHeader}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-[40px]">
        <MyOrganizationBudgetCard
          title="이번 달 예산"
          budget={currentMonthBudget?.startingBudget ?? 0}
          text={`지난 달 예산은 \n ${(previousMonthBudget?.startingBudget ?? 0).toLocaleString()}원이었어요`}
        />
        <MyOrganizationBudgetCard
          title="이번 달 지출액"
          budget={currentMonthBudget?.spentAmount ?? 0}
          text={`지난 달: ${(previousMonthBudget?.spentAmount ?? 0).toLocaleString()}원`}
          suffix={
            <ProgressBar
              percentage={
                (previousMonthBudget?.spentAmount ?? 0) /
                (currentMonthBudget?.startingBudget ?? 1)
              }
              className="mt-[20px]"
            />
          }
          tooltip={
            <div className="flex flex-col gap-[8px]">
              <p className="text-16-extrabold">
                이번 달 남은 예산:
                {(
                  (currentMonthBudget?.startingBudget ?? 0) -
                  (currentMonthBudget?.spentAmount ?? 0)
                ).toLocaleString()}
                원
              </p>
              <p className="text-14-regular text-gray-300">
                지난 달 남은 예산:{' '}
                {(
                  (previousMonthBudget?.startingBudget ?? 0) -
                  (previousMonthBudget?.spentAmount ?? 0)
                ).toLocaleString()}
                원
              </p>
              <p className="text-14-regular text-gray-300">
                지난 달보다{' '}
                {Math.abs(
                  (currentMonthBudget?.spentAmount ?? 0) -
                    (previousMonthBudget?.spentAmount ?? 0),
                ).toLocaleString()}
                원{' '}
                {(currentMonthBudget?.spentAmount ?? 0) -
                  (previousMonthBudget?.spentAmount ?? 0) >=
                0
                  ? '더 사용했어요'
                  : '덜 사용했어요'}
              </p>
            </div>
          }
        />
        <MyOrganizationBudgetCard
          title="올해 총 지출액"
          budget={budgetData?.currentYearSpending ?? 0}
          text={`올해 작년보다\n ${((budgetData?.currentYearSpending ?? 0) - (budgetData?.previousYearSpending ?? 0)).toLocaleString()}원 더 지출했어요`}
          className="col-span-2 md:col-span-1"
        />
      </div>
      {screenSize === 'desktop' && (
        <div className="w-full h-[60px] border-y border-primary-100 grid grid-cols-6 flex items-center text-16-bold text-primary-500">
          <p>구매 요청일</p>
          <p>요청인</p>
          <p>상품</p>
          <p>주문 금액</p>
          <p>구매 승인일</p>
          <p>담당자</p>
        </div>
      )}
      {orderData?.items !== undefined &&
        orderData.items.map((item) =>
          screenSize === 'desktop' ? (
            <ApprovedPurchaseList
              key={item.id}
              requestDate={item.createdAt}
              requester={item.requester}
              product={item.representativeProductName}
              totalItemCount={item.totalItemCount}
              price={item.totalPrice}
              approvalDate={item.createdAt}
              handler={item.handler}
              onClick={() => router.push(`/admin/purchases/${item.id}`)}
            />
          ) : (
            <InfoTable
              key={item.id}
              title={
                <div className="flex justify-between items-center text-16-bold text-primary-950">
                  <h2 className="flex gap-[8px] px-[8px] pb-[14px]">
                    {item.representativeProductName}
                    <p className="text-12-regular text-primary-500">
                      총수량 {item.totalItemCount}개
                    </p>
                  </h2>
                  <h2>{item.totalPrice.toLocaleString()}원</h2>
                </div>
              }
              data={[
                {
                  label: '구매 요청일',
                  value: formatDate(item.createdAt),
                },
                {
                  label: '요청인',
                  value: (
                    <div className="flex gap-[8px]">
                      <p>{item.requester.name}</p>
                      {item.requester?.id === item.handler?.id && (
                        <Badge variant="REQUEST" message="즉시 요청" />
                      )}
                    </div>
                  ),
                },
                {
                  label: '구매 승인일',
                  value: formatDate(item.createdAt),
                },
                {
                  label: '담당자',
                  value: item.handler!.name,
                },
              ]}
              onClick={() => router.push(`/admin/purchases/${item.id}`)}
              className="grid-cols-1 md:grid-cols-2 cursor-pointer"
            />
          ),
        )}
      {orderData?.totalPages !== undefined && (
        <Pagination
          currentPage={page}
          totalPages={orderData.totalPages}
          onPageChange={setPage}
          className="mt-[30px]"
        />
      )}
    </div>
  );
}
