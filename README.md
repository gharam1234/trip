This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 테스트 환경 설정

### 권한 검증 GUARD 테스트 환경 설정

권한 검증 기능을 테스트하기 위해 다음 환경 변수를 설정할 수 있습니다:

1. **테스트 환경 활성화**
   ```bash
   # .env.local 파일에 추가
   NEXT_PUBLIC_TEST_ENV=test
   ```

2. **테스트 환경에서 로그인 검사 제어**
   ```javascript
   // 브라우저 콘솔에서 실행
   window.__TEST_ENV__ = 'test';        // 테스트 환경 활성화
   window.__TEST_BYPASS__ = false;      // 비회원 가드 테스트용 (로그인 검사 수행)
   // window.__TEST_BYPASS__를 설정하지 않으면 기본적으로 로그인 검사 우회
   ```

### 환경별 동작

- **실제 환경**: 항상 로그인 검사를 수행하며, 비로그인 사용자에게는 로그인 확인 모달을 표시
- **테스트 환경**: 기본적으로 로그인 검사를 우회 (로그인 유저로 간주), `window.__TEST_BYPASS__ = false` 설정 시에만 검사 수행

### 테스트 실행

권한 검증 GUARD 기능의 테스트를 실행하려면:

```bash
# Playwright 테스트 실행
npx playwright test src/commons/providers/auth/tests/auth.guard.hook.spec.ts

# 특정 테스트 케이스 실행
npx playwright test src/commons/providers/auth/tests/auth.guard.hook.spec.ts --grep "실제 환경에서 비로그인 사용자 권한 검증"
```

### 테스트 케이스

1. **실제 환경에서 비로그인 사용자 권한 검증**: 비로그인 사용자가 회원 전용 기능에 접근할 때 모달 표시
2. **테스트 환경에서 로그인 검사 우회**: 테스트 환경에서 기본적으로 로그인 검사 우회
3. **테스트 환경에서 비회원 가드 테스트**: 테스트 환경에서도 명시적으로 로그인 검사 수행
4. **로그인 확인 모달 - 로그인 버튼 클릭**: 모달에서 로그인 버튼 클릭 시 로그인 페이지로 이동
5. **로그인 확인 모달 - 취소 버튼 클릭**: 모달에서 취소 버튼 클릭 시 모달 닫기
6. **모달 중복 표시 방지**: 같은 상황에서 모달이 중복으로 표시되지 않음
7. **테스트 환경 설정 함수 동작 확인**: 테스트 환경 설정 함수가 올바르게 동작하는지 확인
