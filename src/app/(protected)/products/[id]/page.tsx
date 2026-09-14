import colaZeroImage from '@/assets/images/cola_zero.png';
import ProductDetail, {
  type ProductDetailSection,
} from '@/components/ui/ProductDetail/ProductDetail';

const DETAIL_SECTIONS: readonly ProductDetailSection[] = [
  {
    key: 'benefit',
    label: '구매혜택',
    content: '5포인트 적립 예정',
  },
  {
    key: 'delivery',
    label: '배송 방법',
    content: '택배',
  },
  {
    key: 'deliveryFee',
    label: '배송비',
    content: (
      <span className="whitespace-nowrap">
        <span className="text-primary-600">
          3,000원 (50,000원 이상 무료 배송)
        </span>
        <span className="ml-2 text-primary-400">도서산간 배송비 추가</span>
      </span>
    ),
  },
];

export default function ProductDetailPage() {
  return (
    <ProductDetail
      category="음료"
      subcategory="청량 · 탄산 음료"
      productName="코카콜라 제로"
      remainingQuantity={29}
      price={2_000}
      imageSrc={colaZeroImage.src}
      imageAlt="코카콜라 제로 350ml 캔"
      initialQuantity={16}
      maxQuantity={30}
      isInitiallyLiked={false}
      detailSections={DETAIL_SECTIONS}
    />
  );
}
