// clsx + tailwind-merge 헬퍼 — 조건부 클래스 및 Tailwind 충돌 병합
import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** twMerge
 *
 * 같은 그룹의 Tailwind 클래스가 중복되면 나중 값만 남기고 앞의 값을 지워줌
 * (예: cn('bg-white', 'bg-primary-50') => 'bg-primary-50')
 *
 * 기본 twMerge는 globals.css의 커스텀 text-16-bold 같은 폰트 토큰을 모르고
 * text 컬러 클래스와 같은 그룹으로 잘못 인식해 지워버리므로, font-size 그룹을 직접 등록해줌
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            '32-extrabold',
            '32-bold',
            '32-regular',
            '30-extrabold',
            '30-bold',
            '30-regular',
            '24-extrabold',
            '24-bold',
            '24-regular',
            '20-extrabold',
            '20-bold',
            '20-regular',
            '18-extrabold',
            '18-bold',
            '18-regular',
            '16-extrabold',
            '16-bold',
            '16-regular',
            '16-extrabold-lead',
            '16-bold-lead',
            '16-regular-lead',
            '14-extrabold',
            '14-bold',
            '14-regular',
            '14-extrabold-lead',
            '14-bold-lead',
            '14-regular-lead',
            '13-extrabold',
            '13-bold',
            '13-regular',
            '12-extrabold',
            '12-bold',
            '12-regular',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
