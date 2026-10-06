import { cookies } from 'next/headers';

import {
  type ProductListParams,
  type ProductListResponse,
  toQueryString,
} from '@/lib/services/productService';

/*
@ 서버에서 상품 목록 첫 페이지 받기 (서버 컴포넌트 전용)
- 목록을 브라우저에서만 받으면 JS 다운로드 → 실행 → API 호출이 끝나야 <img>가 생겨
  느린 회선에서 LCP가 5초 넘게 밀린다. 첫 페이지를 서버에서 받아 HTML에 담으면
  HTML이 도착하자마자 이미지 요청이 시작된다.
- 브라우저용 fetchClient는 '/api' 상대 주소와 브라우저 쿠키를 쓰므로 서버에서는 쓸 수 없다.
  그래서 요청 쿠키를 그대로 실어 API 서버를 직접 부른다.
- 실패하면 null을 돌려준다. 이때 화면은 기존처럼 브라우저에서 목록을 받는다.
  (액세스 토큰 만료도 여기 해당한다. 재발급은 브라우저의 fetchClient가 맡는다.)
*/

// API 서버가 느려도 페이지 응답 전체가 묶이지 않게 기다리는 시간을 제한한다.
const SERVER_FETCH_TIMEOUT_MS = 3000;

export async function fetchProductsOnServer(
  params: ProductListParams,
): Promise<ProductListResponse | null> {
  // next.config의 /api 프록시와 같은 주소를 쓴다. 서버에서만 읽으므로 NEXT_PUBLIC_이 필요 없다.
  // 값이 없으면 에러 없이 브라우저 조회로 넘어가서 성능 개선만 조용히 꺼지니 배포 환경 변수를 확인할 것.
  const apiBaseUrl = process.env.API_URL;

  if (!apiBaseUrl) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const response = await fetch(
      `${apiBaseUrl}/products${toQueryString(params)}`,
      {
        headers: { cookie: cookieStore.toString() },
        cache: 'no-store',
        signal: AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as { data?: ProductListResponse };
    return json.data ?? null;
  } catch {
    return null;
  }
}
