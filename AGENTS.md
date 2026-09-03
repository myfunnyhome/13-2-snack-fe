# Repository Guidelines

## 필수 확인 문서

프론트엔드 코드를 작업하기 전에 반드시 `FE_CONVENTION.md`를 읽고 해당 규칙을 따른다.

현재 프로젝트 설정과 `FE_CONVENTION.md`가 충돌하면 임의로 판단하지 말고 사용자에게 먼저 알린다.

## 프로젝트 구조

이 프로젝트는 TypeScript로 작성된 Next.js 16 App Router 프론트엔드 프로젝트다.

- `src/app`: 페이지, 레이아웃 및 라우팅
- `src/app/(auth)`: 로그인 및 회원가입
- `src/app/(protected)`: 로그인 사용자 공통 페이지
- `src/app/(admin)`: 관리자 페이지
- `src/app/(super-admin)`: 최고 관리자 페이지
- `src/components/ui`: 재사용하는 공용 UI 컴포넌트
- `src/hooks`: 기능별 Custom Hook
- `src/utils`: 공용 유틸리티 함수
- `src/lib/services`: API 및 서비스 접근 로직
- `src/assets`: import해서 사용하는 폰트, 아이콘 및 이미지
- `public`: URL로 직접 접근하는 정적 파일

Route Group은 URL 경로에 포함되지 않는다.

## 개발 명령어

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 검사
- `npm run type-check`: TypeScript 타입 검사
- `npm test`: Jest 테스트 실행
- `npm run test:watch`: Jest Watch 모드 실행

작업 완료 후 관련 검사를 실행하고, 실패한 검사가 있으면 원인을 사용자에게 알린다. 검사 실패를 임의로 무시하거나 설정을 완화하지 않는다.

## 코드 작성 원칙

- TypeScript와 React 함수 컴포넌트를 사용한다.
- 기존 프로젝트의 파일 구조와 작성 방식을 우선한다.
- 요청받지 않은 파일과 기능은 수정하지 않는다.
- 공용 컴포넌트는 `src/components/ui/<ComponentName>`에 작성한다.
- 공용 유틸리티는 `src/utils`에 작성한다.
- 조건부 Tailwind 클래스는 `src/utils/cn.ts`의 `cn()`을 사용한다.
- 라우트 전용 코드는 해당 라우트 가까이에 작성하고, 실제로 재사용될 때 공용 영역으로 분리한다.
- 새로운 라이브러리나 폴더를 임의로 추가하지 않는다.
- 환경변수와 인증정보를 코드 또는 Git에 포함하지 않는다.

세부 네이밍, 포맷, 브랜치, 커밋 및 PR 규칙은 `FE_CONVENTION.md`를 따른다.

## 테스트 원칙

Jest와 `ts-jest`를 사용한다.

- 테스트 파일은 대상 코드 옆이나 대응하는 `__tests__` 폴더에 작성한다.
- 파일명은 `*.test.ts` 또는 `*.test.tsx`를 사용한다.
- 성공, 실패 및 경계 조건을 구분하여 테스트한다.
- 브라우저 API가 필요한 테스트는 적절한 테스트 환경 또는 Mock 필요 여부를 먼저 확인한다.
- 현재 테스트 커버리지 기준은 설정되어 있지 않으므로 임의의 기준을 추가하지 않는다.

## Git 작업 원칙

- Commitlint는 Husky의 `commit-msg` Hook에서 실행된다.
- 커밋 타입은 `feat`, `fix`, `chore`, `refactor`, `docs`만 사용한다.
- 하나의 커밋에는 하나의 작업 목적만 포함한다.
- PR에는 관련 Issue, 검사 결과 및 변경 내용을 작성한다.
- UI 변경이 있으면 스크린샷 또는 화면 녹화를 첨부한다.
- 사용자의 요청 없이 커밋, Push, Merge 또는 브랜치 변경을 실행하지 않는다.
