# CLAUDE.md

이 파일은 이 저장소에서 코드 작업 시 Claude Code (claude.ai/code)를 위한 가이드를 제공합니다.

## 중요: 응답 언어

**항상 한국어로 응답해주세요.** 이 프로젝트의 모든 커뮤니케이션은 한국어로 진행되어야 합니다.

## 프로젝트 개요

Next.js 14와 TypeScript를 사용하는 여행 관련 커뮤니티 게시판 시스템입니다. 인증 기능이 포함되어 있으며, 컴포넌트 기반 아키텍처와 Playwright를 이용한 TDD 방식을 따릅니다.

## 명령어

### 개발
- `npm run dev` - 3000번 포트에서 개발 서버 시작
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행

### 테스트
- `npm run test:e2e` - Playwright E2E 테스트 실행
- `npm run test:e2e:ui` - Playwright UI로 테스트 실행
- `npm run test:e2e:headed` - 헤디드 모드로 Playwright 테스트 실행

### Storybook
- `npm run storybook` - 6006번 포트에서 Storybook 개발 서버 시작
- `npm run build-storybook` - Storybook 빌드

### 개별 테스트 실행
```bash
npx playwright test src/components/boards/tests/index.delete.hook.spec.ts
npx playwright test src/commons/providers/auth/tests/auth.guard.hook.spec.ts --grep "테스트 케이스 이름"
```

## 아키텍처

### 디렉토리 구조
- `src/app/` - Next.js App Router 페이지와 레이아웃
- `src/components/` - 기능별 컴포넌트 (자체 테스트와 GraphQL 작업 포함)
- `src/commons/` - 공용 유틸리티, 프로바이더, 상수
- `src/stories/` - Storybook 스토리

### 주요 패턴

1. **컴포넌트 구성**: 각 컴포넌트는 자체 폴더에 포함:
   - 컴포넌트 구현
   - 테스트 (Playwright E2E)
   - GraphQL 쿼리/뮤테이션 (필요시)
   - 스토리 (Storybook용)

2. **GraphQL 통합**: 각 컴포넌트는 전용 `graphql/` 폴더에서 자체 GraphQL 작업 관리

3. **인증**:
   - `src/commons/providers/auth/`의 인증 프로바이더와 가드 시스템
   - URL 설정을 사용한 라우트 기반 접근 제어
   - 테스트 환경에서 인증 검사 우회 지원

4. **상태 관리**:
   - GraphQL용 Apollo Client
   - Zod 검증과 React Hook Form
   - 최소한의 useState/useEffect를 사용한 로컬 상태

5. **스타일링**:
   - CSS Modules만 사용 (:global, :root, !important 사용 금지)
   - Flexbox 기반 레이아웃 (position-absolute 금지)
   - `src/app/globals.css`의 전역 스타일

### URL 및 라우팅 시스템

라우트는 `src/commons/constants/url.ts`에서 중앙 관리되며 다음 메타데이터 포함:
- 접근 제어 (PUBLIC vs MEMBER_ONLY)
- 배너 및 네비게이션 표시 여부
- 네비게이션 메뉴 설정

### 테스트 환경

테스트 환경 설정 방법:
- `.env.local`에 `NEXT_PUBLIC_TEST_ENV=test`
- 브라우저 콘솔에서 `window.__TEST_ENV__ = 'test'`
- 테스트 모드에서 인증 검사 강제 적용: `window.__TEST_BYPASS__ = false`

### 중요 제약사항

1. **코드 스타일**:
   - 지정된 파일만 수정
   - 설치된 라이브러리만 사용
   - 독립적이고 조합 가능한 컴포넌트로 구성

2. **주석 작성 규칙**:
   - 모든 주석은 반드시 한국어로 작성 (JSDoc `/** */`, 일반 주석 `//`, `/* */` 모두 포함)
   - 코드 수정 시 어떤 이유로 수정했는지 반드시 주석으로 기록
     - 형식: `// 수정 이유: [구체적인 이유]` 또는 `// 변경: [내용] - [이유]`
     - 예시: `// 수정 이유: 페이징 로직 버그 수정으로 인한 무한 루프 방지`
   - 함수/컴포넌트: 기능, 파라미터, 반환값을 한국어로 설명
   - 복잡한 로직: 동작 원리와 구현 이유를 상세히 설명
   - 임시 해결책: 향후 개선 계획을 함께 기록

3. **CSS 규칙**:
   - CSS Modules만 사용
   - position-absolute 금지 (flexbox 사용)
   - 요구사항 이외의 추가 애니메이션 금지

4. **테스트**:
   - TDD 접근 방식 - 테스트 먼저 작성
   - 모의 데이터 대신 실제 데이터 사용
   - 2000ms 미만의 테스트 타임아웃
   - 테스트 선택자로 data-testid 사용

5. **API 통합**:
   - 사전 구성된 프로바이더와 Apollo Client 사용
   - 컴포넌트별 폴더의 GraphQL 작업
   - 테스트에서 하드코딩된 API 응답 금지

## 일반적인 패턴

### 폼 구현
```typescript
// react-hook-form과 zod 사용
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
```

### 네비게이션
```typescript
// URL 상수 사용
import { getPath, linkTo } from '@/commons/constants/url'
router.push getPath('BOARDS_LIST')
```

### 테스트
```typescript
// 안정적인 선택자를 위해 data-testid 사용
await page.locator('[data-testid="submit-button"]').click()
```

### 모달 사용
commons의 사전 구성된 모달 프로바이더 사용.

## 개발 워크플로우

1. Figma 디자인 분석 (제공된 경우)
2. Playwright 테스트 먼저 작성
3. 컴포넌트 구현
4. Storybook 스토리 생성
5. 전체 테스트 스위트 실행

## 테스트 설정

Playwright는 다음과 같이 설정됨:
- 개발 서버에 대해 테스트 실행
- 테스트 환경 변수 사용
- 다른 포트로 병렬 테스트 실행 지원 (AGENT_INDEX)
<!--
=== 변경 주석 (자동 생성) ===
시각: 2025-10-29 17:51:21
변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
학습 키워드: 개념 식별 불가(자동 추정 실패)
-->

