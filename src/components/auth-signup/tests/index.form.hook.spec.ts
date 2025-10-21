import { test, expect, Page } from '@playwright/test';

// 페이지 로드 대기 헬퍼 함수
async function waitForPageLoad(page: Page) {
  await page.waitForSelector('[data-testid="signup-form"]', { timeout: 2000 });
}

// 폼 필드에 값 입력하는 헬퍼 함수
async function fillSignupForm(
  page: Page,
  email: string,
  name: string,
  password: string,
  passwordConfirm: string
) {
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="name-input"]', name);
  await page.fill('[data-testid="password-input"]', password);
  await page.fill('[data-testid="password-confirm-input"]', passwordConfirm);
}

test.describe('회원가입 폼 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 회원가입 페이지로 이동
    await page.goto('/auth/signup');
    await waitForPageLoad(page);
  });

  test.describe('폼 검증', () => {
    test('이메일 형식 오류 - @ 포함 없음', async ({ page }) => {
      // 이메일 입력 필드에 @를 포함하지 않는 값 입력
      await page.fill('[data-testid="email-input"]', 'invalidemail');
      // 다른 필드를 클릭하여 검증 트리거
      await page.fill('[data-testid="name-input"]', '테스트');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="email-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error-message"]')).toContainText('@를 포함');
    });

    test('이메일 필수 입력', async ({ page }) => {
      // 이메일 필드를 비워두고 다른 필드 클릭
      await page.fill('[data-testid="name-input"]', '테스트');
      
      // 회원가입 버튼 클릭 시도
      await page.click('[data-testid="signup-button"]');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="email-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error-message"]')).toContainText('입력해주세요');
    });

    test('이름 필수 입력', async ({ page }) => {
      // 이름 필드를 비워두고 진행
      await fillSignupForm(page, 'test@example.com', '', 'Password123', 'Password123');
      
      // 회원가입 버튼 클릭 시도
      await page.click('[data-testid="signup-button"]');
      
      // 이름 필드에 오류 확인
      await expect(page.locator('[data-testid="name-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-error-message"]')).toContainText('입력해주세요');
    });

    test('비밀번호 조건 오류 - 8자 미만', async ({ page }) => {
      // 비밀번호를 8자 미만으로 입력
      await fillSignupForm(page, 'test@example.com', '테스트', 'Pass12', 'Pass12');
      
      // 회원가입 버튼 클릭 시도
      await page.click('[data-testid="signup-button"]');
      
      // 비밀번호 필드에 오류 확인
      await expect(page.locator('[data-testid="password-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error-message"]')).toContainText('8자');
    });

    test('비밀번호 조건 오류 - 영문 미포함', async ({ page }) => {
      // 비밀번호에 영문이 없이 입력
      await fillSignupForm(page, 'test@example.com', '테스트', '12345678', '12345678');
      
      // 회원가입 버튼 클릭 시도
      await page.click('[data-testid="signup-button"]');
      
      // 비밀번호 필드에 오류 확인
      await expect(page.locator('[data-testid="password-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error-message"]')).toContainText('영문');
    });

    test('비밀번호 조건 오류 - 숫자 미포함', async ({ page }) => {
      // 비밀번호에 숫자가 없이 입력
      await fillSignupForm(page, 'test@example.com', '테스트', 'Password', 'Password');
      
      // 회원가입 버튼 클릭 시도
      await page.click('[data-testid="signup-button"]');
      
      // 비밀번호 필드에 오류 확인
      await expect(page.locator('[data-testid="password-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error-message"]')).toContainText('숫자');
    });

    test('비밀번호 확인 불일치', async ({ page }) => {
      // 비밀번호와 확인 비밀번호가 다르게 입력
      await fillSignupForm(page, 'test@example.com', '테스트', 'Password123', 'Password124');
      
      // 회원가입 버튼 클릭 시도
      await page.click('[data-testid="signup-button"]');
      
      // 비밀번호 확인 필드에 오류 확인
      await expect(page.locator('[data-testid="password-confirm-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-confirm-error-message"]')).toContainText('일치');
    });
  });

  test.describe('유효한 데이터로 회원가입 성공 시나리오', () => {
    test('유효한 데이터로 회원가입 성공', async ({ page }) => {
      // 유효한 데이터로 폼 작성
      const timestamp = Date.now();
      const email = `test+${timestamp}@example.com`;
      const name = '테스트사용자';
      const password = 'Password123';
      
      await fillSignupForm(page, email, name, password, password);
      
      // 회원가입 버튼이 활성화되어 있는지 확인
      await expect(page.locator('[data-testid="signup-button"]')).toBeEnabled();
      
      // 회원가입 버튼 클릭
      await page.click('[data-testid="signup-button"]');
      
      // 성공 모달 대기 및 확인 (2초 타임아웃 - 네트워크 통신)
      await expect(page.locator('text=회원가입 완료')).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('이메일 중복으로 회원가입 실패 시나리오', () => {
    test('이메일 중복으로 회원가입 실패', async ({ page }) => {
      // API를 가로채서 에러 응답 반환하도록 모킹
      await page.route('**/graphql', async (route) => {
        const request = route.request();
        const postData = request.postDataJSON();
        
        // CreateUser mutation인 경우 에러 응답 반환
        if (postData?.query?.includes('CreateUser')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: null,
              errors: [{
                message: '이미 존재하는 이메일입니다.',
                extensions: { code: 'DUPLICATE_EMAIL' }
              }]
            })
          });
        } else {
          await route.continue();
        }
      });

      // 데이터 입력
      const email = 'duplicate@example.com';
      const name = '테스트사용자';
      const password = 'Password123';
      
      await fillSignupForm(page, email, name, password, password);
      
      // 회원가입 버튼 클릭
      await page.click('[data-testid="signup-button"]');
      
      // 실패 모달 대기 및 확인 (타임아웃 없음 - 모킹된 요청이므로 즉시 실패)
      await expect(page.locator('text=회원가입 실패')).toBeVisible({ timeout: 500 });
      
      // 모달의 확인 버튼 클릭
      await page.click('button:has-text("확인")');
      
      // 모달이 닫혀야 함 (페이지는 유지되어 다시 시도 가능)
      await expect(page.locator('text=회원가입 실패')).not.toBeVisible();
    });
  });
});
