'use client';

import { useEffect, useId, useRef, useState } from 'react';

import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import KebabMenuIcon from '@/components/icons/KebabMenuIcon';
import LikeIcon from '@/components/icons/LikeIcon';
import PlusMinusIcon from '@/components/icons/PlusMinusIcon';
import Button from '@/components/ui/Button/Button';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { cn } from '@/utils/cn';

type ProductDetailSection = {
  key: string;
  label: string;
  content: React.ReactNode;
};

type ProductDetailProps = {
  className?: string;
  category: string;
  subcategory: string;
  productName: string;
  remainingQuantity: number;
  price: number;
  imageSrc: string;
  imageAlt: string;
  initialQuantity: number;
  maxQuantity: number;
  isInitiallyLiked: boolean;
  detailSections: readonly ProductDetailSection[];
  onAddToCart?: (quantity: number) => void;
  onLikeChange?: (isLiked: boolean) => void;
  onEditProduct?: () => void;
  onDeleteProduct?: () => void;
};

export default function ProductDetail({
  className,
  category,
  subcategory,
  productName,
  remainingQuantity,
  price,
  imageSrc,
  imageAlt,
  initialQuantity,
  maxQuantity,
  isInitiallyLiked,
  detailSections,
  onAddToCart,
  onLikeChange,
  onEditProduct,
  onDeleteProduct,
}: ProductDetailProps) {
  const safeMaxQuantity = Math.max(1, maxQuantity);
  const quantityInputId = useId();
  const detailsIdPrefix = useId();
  const optionMenuId = useId();
  const optionMenuRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState<string>(
    String(Math.min(Math.max(1, initialQuantity), safeMaxQuantity)),
  );
  const [isLiked, setIsLiked] = useState<boolean>(isInitiallyLiked);
  const [isOptionMenuOpen, setIsOptionMenuOpen] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOptionMenuOpen) return;

    const handlePointerDown = (event: PointerEvent): void => {
      if (optionMenuRef.current?.contains(event.target as Node)) return;

      setIsOptionMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;

      setIsOptionMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOptionMenuOpen]);

  const toggleSection = (sectionKey: string): void => {
    setOpenSections((currentSections) => {
      const nextSections = new Set(currentSections);

      if (nextSections.has(sectionKey)) {
        nextSections.delete(sectionKey);
      } else {
        nextSections.add(sectionKey);
      }

      return nextSections;
    });
  };

  const normalizedQuantity = Math.min(
    Math.max(1, Number(quantity) || 1),
    safeMaxQuantity,
  );

  const toggleLike = (): void => {
    const nextIsLiked = !isLiked;

    setIsLiked(nextIsLiked);
    onLikeChange?.(nextIsLiked);
  };

  const handleEditProduct = (): void => {
    setIsOptionMenuOpen(false);
    onEditProduct?.();
  };

  const handleDeleteProduct = (): void => {
    setIsOptionMenuOpen(false);
    onDeleteProduct?.();
  };

  return (
    <section
      className={cn(
        'mx-auto w-full max-w-[1240px] px-5 pb-20 pt-8 text-primary-950 md:pt-10 lg:pt-12',
        className,
      )}
    >
      <nav
        aria-label="상품 경로"
        className="text-16-regular flex items-center gap-2"
      >
        <span className="whitespace-nowrap text-primary-200">{category}</span>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-16-regular text-primary-950">{subcategory}</span>
      </nav>
      <hr className="mt-8 mb-[30px] border-0 border-t border-primary-100" />

      <div className="grid gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-[540px_604px] lg:gap-14">
        <ProductImage
          src={imageSrc}
          alt={imageAlt}
          size={540}
          background="bg-primary-50"
        />

        <div className="flex min-w-0 flex-col md:pt-8 lg:w-[604px] lg:pt-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-18-regular truncate text-[#171717]">
                  {productName}
                </h1>
                <span className="text-14-bold text-secondary-500">
                  {remainingQuantity}회 구매
                </span>
              </div>
              <p className="text-18-bold mt-3 text-primary-950">
                {price.toLocaleString('ko-KR')}원
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <label
                htmlFor={quantityInputId}
                className="text-16-regular text-primary-950"
              >
                수량
              </label>
              <input
                id={quantityInputId}
                type="number"
                inputMode="numeric"
                min={1}
                max={safeMaxQuantity}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                onBlur={() => setQuantity(String(normalizedQuantity))}
                className="text-16-regular h-[52px] w-[100px] border border-primary-200 bg-white px-4 text-center text-primary-950 outline-none transition-colors [appearance:textfield] focus:border-primary-950 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <div ref={optionMenuRef} className="relative flex shrink-0">
                <button
                  type="button"
                  aria-label="상품 옵션 더보기"
                  aria-haspopup="menu"
                  aria-expanded={isOptionMenuOpen}
                  aria-controls={isOptionMenuOpen ? optionMenuId : undefined}
                  onClick={() => setIsOptionMenuOpen((isOpen) => !isOpen)}
                  className="flex h-[52px] w-6 items-center justify-center opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-950"
                >
                  <KebabMenuIcon className="h-6 w-6" />
                </button>

                {isOptionMenuOpen && (
                  <div
                    id={optionMenuId}
                    role="menu"
                    className="absolute top-full right-0 z-20 mt-2 w-24 border border-primary-100 bg-white lg:top-0 lg:right-auto lg:left-full lg:mt-0 lg:ml-2"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleEditProduct}
                      className="text-16-regular flex h-[49px] w-full items-center px-4 text-left whitespace-nowrap text-primary-950 hover:bg-primary-25 focus-visible:bg-primary-25 focus-visible:outline-none"
                    >
                      상품 수정
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDeleteProduct}
                      className="text-16-regular flex h-[49px] w-full items-center px-4 text-left whitespace-nowrap text-primary-950 hover:bg-primary-25 focus-visible:bg-primary-25 focus-visible:outline-none"
                    >
                      상품 삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex h-16 w-full gap-2">
            <Button
              text="장바구니 담기"
              onClick={() => onAddToCart?.(normalizedQuantity)}
              className="h-16 min-w-0 flex-1 lg:w-[532px] lg:flex-none"
            />
            <button
              type="button"
              aria-label={isLiked ? '좋아요 취소' : '좋아요 추가'}
              aria-pressed={isLiked}
              onClick={toggleLike}
              className="flex h-16 w-16 shrink-0 items-center justify-center border border-primary-100 bg-white transition-colors hover:bg-primary-25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-950"
            >
              <LikeIcon isActive={isLiked} className="h-[30px] w-[30px]" />
            </button>
          </div>

          <div className="mt-8 border-b border-primary-100">
            {detailSections.map((section) => {
              const isOpen = openSections.has(section.key);
              const contentId = `${detailsIdPrefix}-${section.key}`;

              return (
                <div key={section.key} className="border-t border-primary-100">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full items-center justify-between gap-4 py-6 text-left"
                  >
                    <span className="text-20-bold text-primary-950">
                      {section.label}
                    </span>
                    <PlusMinusIcon
                      isMinus={isOpen}
                      className="h-[20px] w-[20px] shrink-0"
                    />
                  </button>
                  <div
                    id={contentId}
                    className={cn(
                      'grid transition-[grid-template-rows] duration-200 ease-out',
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="text-16-regular pb-8 text-primary-600">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export type { ProductDetailProps, ProductDetailSection };
